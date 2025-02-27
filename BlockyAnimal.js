var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
        v_VertPos = u_ModelMatrix * a_Position; 
    }`;




var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    uniform bool u_lightOn;

    void main() {
        vec4 baseColor;
        if (u_whichTexture == -3) {
            baseColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
        } else if (u_whichTexture == -2) {
            baseColor = u_FragColor;
        } else if (u_whichTexture == -1) {
            baseColor = vec4(v_UV, 1.0, 1.0);
        } else if (u_whichTexture == 0) {
            baseColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1) {
            baseColor = texture2D(u_Sampler1, v_UV);
        } else if (u_whichTexture == 2) {
            baseColor = texture2D(u_Sampler2, v_UV);
        } else {
            baseColor = vec4(0.6, 0.4, 0.2, 1.0);
        }

        if (u_lightOn) {
            vec3 lightVector = normalize(u_lightPos - vec3(v_VertPos.xyz));
            vec3 N = normalize(v_Normal);
            float nDotL = max(dot(N, lightVector), 0.0);
            vec3 diffuse = vec3(baseColor) * nDotL;
            vec3 ambient = vec3(baseColor) * 0.5;
            vec3 R = reflect(-lightVector, N);
            vec3 E = normalize(u_cameraPos - vec3(v_VertPos.xyz));
            float specular = pow(max(dot(E, R), 0.0), 10.0);
            vec3 specularComponent = vec3(1.0) * specular * 1.5;

            if (u_whichTexture == 0) {
                gl_FragColor = vec4(diffuse + ambient + specularComponent, 1.0);
            } else {
                gl_FragColor = vec4(diffuse + ambient, 1.0);
            }
        } else {
            // When the light is off, just display the base color possibly with an ambient light factor
            gl_FragColor = vec4(vec3(baseColor) * 0.5 + 0.5, 1.0); // Mix base color with a bit of light
        }
    }`;
  

// Global Variables for WebGL
let canvas = 0;
let gl = 0;
let a_Position = 0;
let a_UV = 0; 
let u_FragColor = 0; 
let u_ModelMatrix = 0;
let u_GlobalRotateMatrix = 0; 
let u_ProjectionMatrix = 0; 
let u_ViewMatrix = 0; 
let u_Sampler0 = 0;
let u_whichTexture = 0;
let g_globalAngle = 0;
let u_lightPos = 0;
let u_cameraPos = 0;
let u_lightOn = 0;
let u_NormalMatrix = 0;



function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

    if (!gl) {
        console.error("WebGL context failed to initialize!");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

// Shader Debugging Function
function initShadersWithLogging(gl, vshader, fshader) {
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
        console.error('Failed to create program');
        return false;
    }
    gl.useProgram(program);
    gl.program = program;

    return true;
}

function connectVariablesToGLSL() {
    if (!initShadersWithLogging(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.error('Shader initialization failed.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_UV = gl.getAttribLocation(gl.program, "a_UV");
    a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
    u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
    u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
    u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
    u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");

    if (
        a_Position < 0 || a_UV < 0 || !u_FragColor ||
        !u_ModelMatrix || !u_GlobalRotateMatrix ||
        !u_ProjectionMatrix || !u_ViewMatrix ||
        !u_Sampler0 || !u_whichTexture || !u_lightPos ||
        !u_cameraPos || !u_lightOn || !u_NormalMatrix

    ) {
        console.error("Error getting shader variable locations");
        return;
    }

    var identity_Matrix = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identity_Matrix.elements);

    // Explicitly enable attributes
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_UV);
}

function initTextures() {
    let image0 = new Image();
    let image1 = new Image();
    let image2 = new Image();

    image0.onload = function () {
        sendTextureToGLSL(0, u_Sampler0, image0);
    };
    image1.onload = function () {
        sendTextureToGLSL(1, u_Sampler1, image1);
    };

    image2.onload = function () {
        sendTextureToGLSL(2, u_Sampler2, image2);
    };
    

    image0.src = "GoodSky.png"; 
    image1.src = "grass.jpg";
    image2.src = "dirt.jpg";
}



function sendTextureToGLSL(n, u_Sampler, image) {
    let texture = gl.createTexture();
    if (!texture) {
        console.error("Failed to create texture object");
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + n);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, n);

    console.log(`Texture ${n} Loaded:`, gl.getParameter(gl.TEXTURE_BINDING_2D));
}

let lastX = -1;
let lastY = -1;
let isDragging = false;

let g_normalOn = false;

let g_lightPos = [0,1,-2];

let g_lightOn = false;


function addActionsForHtmlUI(){

    document.getElementById("angleSlide").addEventListener("mousemove", function() {g_globalAngle = this.value; renderScene(); });
    document.getElementById("normalOn").onclick = function() {g_normalOn = true;};
    document.getElementById("normalOff").onclick = function() {g_normalOn = false;};
    document.getElementById("lightOn").onclick = function() {g_lightOn = true;};
    document.getElementById("lightOff").onclick = function() {g_lightOn = false;};



    document.getElementById("lightX").addEventListener("mousemove", function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderScene(); }});
    document.getElementById("lightY").addEventListener("mousemove", function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderScene(); }});
    document.getElementById("lightZ").addEventListener("mousemove", function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderScene(); }});
    document.addEventListener("keydown", function(event) {
        switch (event.key) {
            case "w": g_camera.moveForward(); break;
            case "s": g_camera.moveBackwards(); break;
            case "a": g_camera.moveLeft(); break;
            case "d": g_camera.moveRight(); break;
            case "q": g_camera.panLeft(); break;
            case "e": g_camera.panRight(); break;
            case "ArrowLeft": g_camera.rotateLeftRight(-5); break;
            case "ArrowRight": g_camera.rotateLeftRight(5); break;
            case "ArrowUp": g_camera.rotateUpDown(-5); break;
            case "ArrowDown": g_camera.rotateUpDown(5); break;
        }
        renderScene();
    });
    
    document.addEventListener("mousedown", (event) => {

        lastX = event.clientX;
        lastY = event.clientY;
        isDragging = true;

    });

    document.addEventListener("mousemove", (event) => {
        if (isDragging) {
            let deltaX = event.clientX - lastX;
            let deltaY = event.clientY - lastY;
            g_camera.pan(deltaX, deltaY);
            lastX = event.clientX;
            lastY = event.clientY;
            renderScene();
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    document.addEventListener("wheel", (event) => {
        if(event.deltaY < 0){

            g_camera.moveForward();

        }else{
            g_camera.moveBackwards();
        }
        renderScene();
    });
}

function main() {
    setupWebGL();
    g_camera = new Camera(canvas);
    connectVariablesToGLSL();
    initTextures();
    addActionsForHtmlUI();


    document.onkeydown = keydown;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(tick);

    renderScene();
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;


function tick() {

    g_seconds = performance.now()/1000.0 - g_startTime;

    updateAnimationAngles();

    renderScene();

    requestAnimationFrame(tick);


}


function updateAnimationAngles(){

    g_lightPos[0] = Math.cos(g_seconds);


}



function keydown(ev){


    if(ev.keyCode == 39){ //Right Arrow Key

        g_eye[0] += 0.2;

    }else{
        
        if(ev.keyCode == 37){ //Left Arrow Key

            g_eye[0] -=0.2;
        }
    }

    renderScene();
    console.log(ev.keyCode);

}


// var g_map = [];
// for (var i = 0; i < 40; i++) {
//     g_map[i] = [];
//     for (var j = 0; j < 40; j++) {
//         g_map[i][j] = Math.random() > 0.8 ? Math.floor(Math.random() * 4) : 0;
//     }
// }


// function drawMap(){
//     for(var x = 0; x < g_map.length; x++){
//         for(var z = 0; z < g_map[x].length; z++){
//             var height = g_map[x][z];
//             for (var y = 0; y < height; y++) {
//                 var block = new Cube();
//                 block.color = [1, 1, 1, 1];
//                 block.textureNum = 2;
//                 block.matrix.translate(x - g_map.length / 2, y - 0.75, z - g_map[x].length / 2);
//                 gl.uniform1i(u_whichTexture, block.textureNum);
//                 block.renderfast();
//             }
//         }
//     }
// }





function renderScene() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);

    var projMat = new Matrix4();
    projMat.setPerspective(50, 1 * canvas.width/canvas.height, 1 ,100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);

    var viewMat = new Matrix4();

    viewMat.setLookAt(g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
        g_camera.at.x, g_camera.at.y, g_camera.at.z,
        g_camera.up.x, g_camera.up.y, g_camera.up.z)


    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);


    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);
    gl.uniform1i(u_lightOn, g_lightOn);

    //Light

    var light = new Cube();
    light.color = [2,2,0,1];
    light.textureNum = -2;
    light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
    light.matrix.scale(-.1,-.1,-.1);
    light.matrix.translate(-.5,-.5,-.5);
    light.render();



    //Floor

    var floor = new Cube();
    floor.color = [1.0, 0.0, 0.0, 1.0];
    floor.textureNum = 1;
    floor.matrix.translate(0, -.75, 0.0);
    floor.matrix.scale(5, 0.1 ,5);
    floor.matrix.translate(-0.5, 0, -0.5);
    // floor.render();

    //Sky

    var sky = new Cube();
    sky.color = [0.529, 0.808, 0.922, 1.0];
    sky.textureNum = -2;
    if (g_normalOn) {
        sky.textureNum = -3; 
    }
    sky.matrix.translate(0, -0.75, 0);
    sky.matrix.scale(-5, -5, -5);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.normalMatrix.setInverseOf(sky.matrix).transpose();
    sky.render();

    //Cube

    var block = new Cube();
    block.color = [1.0, 0.0, 0.0, 1.0];
    block.textureNum = 0;
    block.matrix.translate(0, -.75, 0.0);
    block.matrix.scale(-1, -1 ,-1);
    block.matrix.translate(-0.5, 0, -0.5);
    block.render();


    //Sphere

    var sphere = new Sphere();
    sphere.color = [1.0, 0.0, 0.0, 1.0];
    sphere.textureNum = -3;
    sphere.matrix.translate(0, -.75, 0.0);
    sphere.matrix.scale(-0.5, -0.5 ,-0.5);
    sphere.matrix.translate(1, 0, -3);
    sphere.render();
    

}