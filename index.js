//// Core modules

//// External modules
const express = require('express');
const bodyParser = require('body-parser');
const lodash = require('lodash');
const nunjucks = require('nunjucks');
const fileUpload = require('express-fileupload');

//// Modules
const uploader = require('./uploader');



//// Create app
const app = express();

//// Setup view
// Setup nunjucks loader. See https://mozilla.github.io/nunjucks/api.html#loader
let loaderFsNunjucks = new nunjucks.FileSystemLoader('./view', {
    "watch": true,
    "noCache": true
});
// Setup nunjucks environment. See https://mozilla.github.io/nunjucks/api.html#environment
let nunjucksEnv = new nunjucks.Environment(loaderFsNunjucks, {
    "autoescape": true,
    "throwOnUndefined": false,
    "trimBlocks": false,
    "lstripBlocks": false
});
nunjucksEnv.express(app);

app.use(express.static('./public'));
app.use(express.static('./uploads'));

// Parse http body
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


let handleExpressUploadMagic = async (req, res, next) => {
    try {
        let uploadDir = './uploads'

        let files = lodash.get(req, 'files', [])
        let localFiles = await uploader.handleExpressUploadLocalAsync(files, uploadDir)
        // let imageVariants = await uploader.resizeImagesAsync(localFiles, null, uploadDir); // Resize uploaded images

        // let uploadList = uploader.generateUploadList(imageVariants, localFiles)
        // let saveList = uploader.generateSaveList(imageVariants, localFiles)
        // await uploader.deleteUploadsAsync(localFiles, imageVariants)
        req.localFiles = localFiles
        // req.imageVariants = imageVariants
        // req.saveList = saveList
        next()
    } catch (err) {
        next(err)
    }
}

app.get('/', (req, res, next)=>{
    try {
        res.render('index.html')
    } catch (err){
        next(err);
    }
});
app.get('/plain', (req, res, next)=>{
    try {
        res.render('plain.html')
    } catch (err){
        next(err);
    }
});
app.get('/ajax', (req, res, next)=>{
    try {
        res.render('ajax.html')
    } catch (err){
        next(err);
    }
});

app.post('/upload', fileUpload(), handleExpressUploadMagic, async (req, res, next)=>{
    try {
        let body = req.body
        let files = req.files
        console.log({
            body: body,
            files: files,
        })
        res.send({
            body: body,
            files: files,
        });

    } catch (err){
        next(err);
    }
});

// Error handler
app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    console.log(err);
    
    // Anything that is not catched
    res.status(500).send('Something broke!');
});

let server = app;
let port = 1992;
server.listen(port, function () {
    console.log(`App running at http://localhost:${port}`);
});
server.keepAliveTimeout = 60000 * 2;