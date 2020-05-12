# Vue Uploader
Multi-instance vue uploader bootstrap 4 compatible



## Installation

* Add method and enctype attributes in your form: `<form id="formUpload" method="POST" enctype="multipart/form-data">` 
* Add the component `<vue-uploader id="photo" name="photo" url="/upload"></vue-uploader>`
* Include vue <script src="/js/vue.js"></script>
* Include the component <script src="/js/vue-uploader.js"></script>
* Initialize vue

    <script>
        Vue.component('vue-uploader', VueUploader.nonAjaxComponent); // Use the non-ajax component
        new Vue({
            el: "#formUpload",
        });
        
    </script>


## Usage

Run the test server by typing: `npm run dev`