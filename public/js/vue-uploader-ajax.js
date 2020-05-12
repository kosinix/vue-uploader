// Define a new component
if (typeof VueUploader === 'undefined') {
    function VueUploader() { }
}

VueUploader.ajax = {
    data: function () {
        return {
            UPLOADER_STATUS: { // Constants
                READY: "ready", // No file in queue. Waiting for files to be selected.
                PROCESSING: "processing", // Selected files being processed before queueing.
                QUEUED: "queued", // At least 1 file queued.
                UPLOADING: "uploading",
                ERROR: "error", // An error was encountered
            },
            FILE_STATUS: { // Constants
                CRUNCHING: "crunching", // File being resized in the browser. Applies only to images and if browser supports it.
                QUEUED: "queued", // File queued and ready to be uploaded
                UPLOADING: "uploading", // 
                ERROR: "error", // An error occured during upload
                UPLOADED: "uploaded" // On server
            },
            disabled: false,
            fileField: null, // The <input type="file" element
            files: [],
            status: '',
        }
    },
    props: {
        id: {
            default: '',
            type: String,
            required: true
        },
        name: {
            default: '',
            type: String,
            required: true
        },
        url: {
            default: '',
            type: String,
            required: true
        },
        label: {
            default: 'Choose File',
            type: String
        },
        className: {
            default: 'vue-uploader',
            type: String
        },
        accept: {
            default: 'image/jpeg,image/png,application/pdf',
            type: String
        },
        fileIcon: {
            default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzRERDMzQjY5NDZEMTFFQTk0NjBCMjcxQjg4NUE2MEQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzRERDMzQjc5NDZEMTFFQTk0NjBCMjcxQjg4NUE2MEQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozNEREMzNCNDk0NkQxMUVBOTQ2MEIyNzFCODg1QTYwRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNEREMzNCNTk0NkQxMUVBOTQ2MEIyNzFCODg1QTYwRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgKUiSMAAAJgSURBVHja7Jo/aBphFMDfnafeYYdSRQVpVycV7NCtRVARBKeMCVkKhSaBpJQ6tYPdSiFkKIRAErp079JdCA7ZutnBWUQtDnL+Of/kvY8eSM0FYzmvB+/Bh/rx+b73e/8E30nz+RwWpVKpgKZpMJvNnkmSdDCdTp/jdgDskb7H47nGe05wXY1GI7oXAoGAeCXbcF8cRDugXC4vKVAsFG+jgktVVZVIJAJ4iS3WTyaTR71e74mu61s+n+8jbn24r44lAK/X+xQVf41Go3Iul4NQKAR2CXkYAaBarUKj0Xgvy/IDdNyb++iQl4gU5a3f7xfGh8NhEUq7Fgk5qFQqQTwepzQ5wruP/wkAvf8iGAwKxfge7BSKgGEYgJ6HYrEIiUQCxuPxIYJ8WRsARbUr563ELNhsNisgsJhf4/YpLmkdgPnfnWlTQo4rFAqQTCZhMBi8wq0zCxvvBHBMzEhQ/aXTaUqnl/j5gthcAWBCUO8nCIoEQuwixKUVxH8HYELQyufzkEqlqNB3EGrfNQCL6ZTJZMx27i4AEwJ/WAUAttaHrgNY7E7UHV0L4Jo2ygAMwAAMwAAMwAAMwAAMwAAMwAAMwAAMwAAMwAAM4CCAZE7H3QowcWrIZyV/xr2r/b0uy/JPmp7rui6GC04KzQXoGYl2u012/b7tzNKjBoqiHPf7/SyN/2luq6oqOBURMr5Wq0Gn0yGA85UADMP4gTXwqV6vv2u1WhCLxTYOQTVIE/xmsym8j5H4PhwOT1YCwIP0hbKmab8wlfa63e5juGNOa6PM0OstTONvCPSZfHvboRsBBgCV2j3fVnR0TgAAAABJRU5ErkJggg==',
            type: String
        },
        pdfIcon: {
            default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEYwQUUxQUE5NDZFMTFFQUJFQjRGNkQwMjNEMTI0MTQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEYwQUUxQUI5NDZFMTFFQUJFQjRGNkQwMjNEMTI0MTQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0RjBBRTFBODk0NkUxMUVBQkVCNEY2RDAyM0QxMjQxNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0RjBBRTFBOTk0NkUxMUVBQkVCNEY2RDAyM0QxMjQxNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrVF0w4AABETSURBVHja7F0NfFTV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',
            type: String
        },
        max: {
            default: "-1",
            type: String
        },
        fileSize: {
            default: "100000000", // 100MB (100,000,000 bytes)
            type: String
        },
        multiple: {
            default: "false", // Multiple file selection
            type: String
        },
        defaultFiles: { // Full url of files
            default: [],
            type: Array
        },
        resizedDim: {
            default: 1000, // If file is an image, resize it before upload. Fits width and height inside 1000px
            type: Number
        },
    },
    created: function () {
        var me = this;
        for (var i = 0; i < me.defaultFiles.length; i++) {
            me.defaultFiles[i] = {
                uid: me.genUid(),
                preview: me.defaultFiles[i],
                status: me.FILE_STATUS.UPLOADED
            };
        }
        me.defaultFiles = me.defaultFiles;
        me.status = me.UPLOADER_STATUS.READY;
        me.$emit('uploader-created', me.uploaderState());
    },
    computed: {
        fileSizeLimit: function () {
            return parseInt(this.fileSize);
        },
        maxCount: function () {
            return parseInt(this.max);
        },
        isMultiple: function () {
            return (this.multiple === "true" || this.multiple === true)
        }
    },
    watch: {
        status: function (status) {
            this.$emit('status-change', status);
        },
    },
    methods: {
        readAsDataURLAsync: function (file){
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();  
                reader.onerror = reject;
                reader.onload = function() {
                    resolve(reader.result)
                };
                reader.readAsDataURL(file);
            });
        },
        readImageAsync: function (imageSrc){
            return new Promise(function (resolve, reject) {
                var image = new Image();  
                image.onerror = reject;
                image.onload = function() {
                    resolve(image)
                };
                image.src = imageSrc
            });
        },
        resizeImageAsync: function (image, resizedDim, mimeType){
            return new Promise(function (resolve, reject) {
                try {
                    // Resize image and assign it to file.blob
                    var destW = resizedDim;
                    var destH = resizedDim;
                    var newW = destW
                    var newH = destH
                    if (image.width > image.height) {
                        newH = Math.floor(image.height / image.width * newW)
                    }
                    if (image.width < image.height) {
                        newW = Math.floor(image.width / image.height * newH)
                    }
                    var offScreenCanvas = document.createElement('canvas')
                    var ctx = offScreenCanvas.getContext("2d");
                    offScreenCanvas.width = newW;
                    offScreenCanvas.height = newH;
                    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, offScreenCanvas.width, offScreenCanvas.height);
                    ctx.imageSmoothingEnabled = true;
                    if(!mimeType) mimeType = 'image/jpeg'
                    var preview = offScreenCanvas.toDataURL(mimeType)
                    offScreenCanvas.toBlob(function (blob) {
                        resolve({
                            preview: preview,
                            blob: blob,
                        })
                    });
                } catch (err) { // fallback
                    reject(err)
                }
            });
        },
        genUid: function (len) {
            if (!len) len = 16;

            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < len; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        },
        uploaderState: function () {
            var me = this;
            return {
                id: me.id,
                name: me.name,
                defaultFiles: me.defaultFiles,
                files: me.files,
                status: me.status
            };
        },
        /**
         * On IE11 and Edge - Cancel does not trigger an on change event of <input file>
         * 
         * @param {*} event 
         */
        browseFile: function (event) {
            var me = this;

            // Clear file list on every browse to simulate the actual <input type="file" /> browse behavior
            var files = [];
            me.files = [];
            this.$emit('files-change', files);

            // Get selected files
            if ('target' in event) {
                if ('files' in event.target) {
                    files = event.target.files // Available in IE11
                }
            }

            // Reset status on browse
            me.status = me.UPLOADER_STATUS.READY;

            if (files) {
                me.fileField = event.target; // TODO: What does this do

                // If max count is not -1 and selected is more than max count
                if (me.maxCount !== -1 && files.length > me.maxCount) {

                    // Remove all FileList content
                    event.target.value = "";
                    var error = new Error('Maximum of ' + this.maxCount + ' file(s) only');
                    error.code = 1010;
                    me.$emit('uploader-error', error, me.uploaderState());
                    return;
                }

                var count = files.length;
                var accepted = me.accept.split(',');

                // Error check for each file
                for (var i = 0; i < count; i++) {
                    var file = files[i]
                    // If one file is bigger than allowed bytes, abort
                    if (files[i].size > me.fileSizeLimit) {
                        // Remove all FileList content
                        event.target.value = "";
                        var error = new Error('A single file must not exceed ' + this.fileSizeLimit / 1000000 + ' MB');
                        error.code = 1020;
                        me.$emit('uploader-error', error, me.uploaderState());
                        return;
                    }
                    // If one file is not accepted, abort
                    if (accepted.indexOf(files[i].type) === -1) {
                        // Remove all FileList content
                        event.target.value = "";
                        var error = new Error('File type '+ file.type +' not allowed. Must be one of the following: ' + me.accept);
                        error.code = 1030;
                        me.$emit('uploader-error', error, me.uploaderState());
                        return;
                    }
                }


                for (var i = 0; i < count; i++) {
                    me.addFile(files[i])
                }

            }
        },
        addFile: function (file) {
            var me = this;

            var uid = this.genUid();
            var fileWrapper = {
                uid: uid, // a globally unique id for the specific file.
                file: file, // Native instance of File
                blob: undefined, // Will contain the blob of the resized image (if supported)
                preview: me.fileIcon, // Data for image preview
                name: file.name, // File.name for example "myfile.gif".
                type: file.type, // File.type, e.g image/jpeg
                size: file.size, // Original file size in bytes.
                uploaded: 0, // Number of bytes uploaded of the files total size.
                percent: 0, // Number of percentage uploaded of the file.
                status: me.FILE_STATUS.QUEUED, // See constants
                lastModifiedDate: file.lastModifiedDate // Last modified date. Instance of native Date
            };

            me.files.push(fileWrapper);
            
            // Images
            if (['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].indexOf(file.type) !== -1) {

                if(typeof FileReader === "undefined"){ // FileReader unsupported

                    me.$emit('file-added', fileWrapper, me.uploaderState());

                } else { // FileReader exist
                    // Read file
                    me.readAsDataURLAsync(file).then(function(dataURL){
                        fileWrapper.status = me.FILE_STATUS.CRUNCHING;
                        fileWrapper.preview = dataURL;

                        // Read image
                        return me.readImageAsync(dataURL)
                    }).then(function(image){

                        // Resize
                        return me.resizeImageAsync(image, me.resizedDim, file.type)
                        
                    }).then(function(blobPreview){
                        fileWrapper.preview = blobPreview.preview
                        fileWrapper.blob = blobPreview.blob

                    }).catch(function(err){
                        console.log('catch',err)
                    }).then(function(){
                        fileWrapper.status = me.FILE_STATUS.QUEUED;
                        me.status = me.UPLOADER_STATUS.QUEUED;
                        me.$emit('file-added', fileWrapper, me.uploaderState());
                    })

                }

            } else if (['application/pdf'].indexOf(file.type) !== -1) {

                fileWrapper.preview = me.pdfIcon;
                fileWrapper.status = me.FILE_STATUS.QUEUED;
                me.status = me.UPLOADER_STATUS.QUEUED;
                me.$emit('file-added', fileWrapper, me.uploaderState());

            } else { // Non image files

                fileWrapper.status = me.FILE_STATUS.QUEUED;
                me.status = me.UPLOADER_STATUS.QUEUED;
                me.$emit('file-added', fileWrapper, me.uploaderState());
            }
        },
        uploadFile: function (file, index) {
            var me = this;
            if (file.status === me.FILE_STATUS.UPLOADED || file.status === me.FILE_STATUS.UPLOADING) return;

            var xhr = new XMLHttpRequest();

            (xhr.upload || xhr).addEventListener('progress', function (e) {
                var current = e.position || e.loaded
                var total = e.totalSize || e.total;

                file.status = me.FILE_STATUS.UPLOADING;
                file.uploaded = current;
                file.percent = Math.round(current / total * 100);
                me.status = me.UPLOADER_STATUS.UPLOADING;
                me.$emit('file-progress', file, me.uploaderState(), e);
            });
            xhr.addEventListener('error', function (e) {
                file.status = me.FILE_STATUS.ERROR;
                me.status = me.UPLOADER_STATUS.ERROR;
                me.$emit('file-error', file, me.uploaderState(), e);
            });
            xhr.addEventListener('abort', function (e) {
                file.status = me.FILE_STATUS.ERROR;
                me.status = me.UPLOADER_STATUS.ERROR;
                me.$emit('file-abort', file, me.uploaderState(), e);
            });
            xhr.addEventListener('load', function (e) {
                var status = this.status;
                var response = this.responseText;

                if(status !== 200){
                    file.status = me.FILE_STATUS.ERROR;
                    me.$emit('file-error', file, me.uploaderState(), e, response);
                    return false
                }
                file.status = me.FILE_STATUS.UPLOADED;
                me.$emit('file-uploaded', file, me.uploaderState(), e, response); // response

                var count = me.files.length;
                var done = true;
                for (var x = 0; x < count; x++) {
                    var f = me.files[x];
                    if (f.status !== me.FILE_STATUS.UPLOADED) {
                        done = false; // If at least one is not uploaded, not done!
                    }
                }

                if (done) {
                    me.fileField.value = ""; // Remove contents
                    me.status = me.UPLOADER_STATUS.READY;
                    me.$emit('upload-complete', me.files, me.uploaderState(), e, response)
                }
            });
            xhr.open('post', me.url, true); // Async 3rd arg
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // For express req.xhr

            var formData = new FormData();
            if(file.blob !== undefined){
                formData.append(me.name, file.blob);
            } else {
                formData.append(me.name, file.file);
            }

            xhr.send(formData);
        },
        uploadBatch: function () {
            var me = this;

            if (me.status !== me.UPLOADER_STATUS.QUEUED) {
                var error = new Error('Nothing to upload.');
                error.code = 1040;
                me.$emit('uploader-error', error, me.uploaderState());
                return;
            }

            var count = me.files.length;
            for (var x = 0; x < count; x++) {
                var file = me.files[x];
                me.uploadFile(file, x);
            }
        },
        upload: function () {
            var me = this;

            me.uploadBatch();
        },
    },
    template: '' +
        '<div v-bind:class="className">' +
            '<div class="vup-files row text-center" style="margin-bottom:5px;">' +
                '<div v-for="file in defaultFiles" class="vup-file col-3" v-bind:data-status="file.status" style="max-width:100px">' +
                    '<div class="vup-info">' +
                        '<img v-bind:src="file.preview" alt="Preview" style="width:100%">' +
                    '</div>' +
                '</div>' +
                '<div v-for="file in files" class="vup-file col-3" v-bind:data-status="file.status" style="max-width:100px">' +
                    '<div class="vup-info">' +
                        '<img v-bind:src="file.preview" alt="Preview" style="width:100%">' +
                        '<div v-if="file.status===\'error\'" style="position:relative; height: 3px">' +
                            '<div v-bind:style="\'position:absolute; background:red; height:3px; left: 0; top: 0; width:\'+file.percent+\'%\'"></div>' +
                        '</div>' +
                        '<div v-else-if="file.status===\'uploaded\'" style="position:relative; height: 3px">' +
                            '<div v-bind:style="\'position:absolute; background:green; height:3px; left: 0; top: 0; width:\'+file.percent+\'%\'"></div>' +
                        '</div>' +
                        '<div v-else style="position:relative; height: 3px">' +
                            '<div v-bind:style="\'position:absolute; background:orange; height:3px; left: 0; top: 0; width:\'+file.percent+\'%\'"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="custom-file">' +
                '<input v-on:change="browseFile" type="file" class="custom-file-input" v-bind:id="id" v-bind:name="name" v-bind:multiple="isMultiple" v-bind:accept="accept">' +
                '<label class="custom-file-label" v-bind:for="id">{{label}}</label>' +
            '</div>' +
        '</div>'
};