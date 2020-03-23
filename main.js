
var camera = new THREE.PerspectiveCamera( 60, innerWidth / innerHeight, 0.25, 2000 );
camera.position.set( 50, 50, 50 );

var scene = new THREE.Scene();

svgTexture(`
    <svg width="32px" height="32px" xmlns="http://www.w3.org/2000/svg"> 
        <circle r="15" cx="16" cy="16" fill="white"></circle>
    </svg>
`, function (texture) {

    var loader = new THREE.GLTFLoader();
    loader.load( 'scene.gltf', function ( gltf ) {

        gltf.scene.traverse(function(e) {
            if (e.material) {
                e.material.size = 4;
                e.material.map = texture;
                e.material.needsUpdate = texture;
            }
        });

        scene.add( gltf.scene );
        // const helper = new THREE.BoxHelper(gltf.scene );
        // helper.geometry.computeBoundingBox();
        // scene.add( helper );
        render();
    } );


})


//var light = new THREE.DirectionalLight(0xffffff);
//light.position.set(200, 400, 200);
//scene.add(light);

// new THREE.RGBELoader()
//     .setDataType( THREE.UnsignedByteType )
//     .load( 'https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr', function ( texture ) {
//         var envMap = pmremGenerator.fromEquirectangular( texture ).texture;
//         scene.background = envMap;
//         scene.environment = envMap;
//         texture.dispose();
//         pmremGenerator.dispose();
//         render();
//     } );


var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( devicePixelRatio );
renderer.setSize( innerWidth, innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild( renderer.domElement );

//var pmremGenerator = new THREE.PMREMGenerator( renderer );
//pmremGenerator.compileEquirectangularShader();

var renderScene = new THREE.RenderPass( scene, camera );
let size = new THREE.Vector2( innerWidth, innerHeight );
var bloomPass = new THREE.UnrealBloomPass(size, 1.5, 0.4, 0.85 );
bloomPass.threshold = 0.1;
bloomPass.strength = 2;
bloomPass.radius = 1;

var composer = new THREE.EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render );
controls.minDistance = 100;
controls.maxDistance = 1000

controls.update();

addEventListener( 'resize', onWindowResize, false );

function render() {
    composer.render();
}

function onWindowResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( innerWidth, innerHeight );
    render();
}

function svgTexture(svg, callback) {
    let img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svg);
    img.onload = () => {
        let cnv = document.createElement("canvas");
        cnv.width = img.width;
        cnv.height = img.height;
        let ctx = cnv.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var texture = new THREE.Texture(cnv);
        texture.anisotropy = 32;
        texture.needsUpdate = true;
        callback(texture, ctx);
    };
}