class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -1;
    }

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        drawTriangle3DUVNormal(
            [0,0,0 , 1,1,0,  1,0,0 ],
            [0,0, 1,1, 1,0],
            [0,0,-1, -0,0,-1, 0,0,-1]);

        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);


        // // Front face
        // drawTriangle3DUVNormal([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0], Array(3).fill(frontNormal).flat());
        // drawTriangle3DUVNormal([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1], Array(3).fill(frontNormal).flat());

        // Top face
        drawTriangle3DUVNormal([0, 1, 0, 0, 1, 1, 1, 1, 1], [0,0, 0,1,  1,1], [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0, 1, 0, 1, 1, 1, 1, 1, 0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);

        // Right face
        drawTriangle3DUVNormal([1, 0, 0, 1, 1, 0, 1, 1, 1], [0, 0, 1, 0, 1, 1], [1, 0, 0, 1, 0, 0, 1, 0, 0]);
        drawTriangle3DUVNormal([1, 0, 0, 1, 1, 1, 1, 0, 1], [0, 0, 1, 1, 0, 1], [1, 0, 0, 1, 0, 0, 1, 0, 0]);

        // Left face
        drawTriangle3DUVNormal([0, 0, 0, 0, 0, 1, 0, 1, 1], [0, 0, 1, 0, 1, 1], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);
        drawTriangle3DUVNormal([0, 0, 0, 0, 1, 1, 0, 1, 0], [0, 0, 1, 1, 0, 1], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);

        // Bottom face
        drawTriangle3DUVNormal([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 1, 0, 1, 1], [0, -1, 0, 0, -1, 0, 0, -1, 0]);
        drawTriangle3DUVNormal([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 0, 1], [0, -1, 0, 0, -1, 0, 0, -1, 0]);

        // Back face
        drawTriangle3DUVNormal([0, 0, 1, 1, 0, 1, 1, 1, 1], [0, 0, 1, 0, 1, 1], [0, 0, -1, 0, 0, -1, 0, 0, -1]);
        drawTriangle3DUVNormal([0, 0, 1, 1, 1, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1], [0, 0, -1, 0, 0, -1, 0, 0, -1]);
    }



    renderfast() {
        var rgba = this.color;
    
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        var allverts = [];
    
        // Front face
        allverts = allverts.concat([
            0, 0, 0, 0, 0,   // Bottom-left
            1, 0, 0, 1, 0,   // Bottom-right
            1, 1, 0, 1, 1,   // Top-right
            0, 0, 0, 0, 0,   // Bottom-left
            1, 1, 0, 1, 1,   // Top-right
            0, 1, 0, 0, 1    // Top-left
        ]);
    
        // Back face
        allverts = allverts.concat([
            1, 0, 1, 0, 0,   // Bottom-right
            0, 0, 1, 1, 0,   // Bottom-left
            0, 1, 1, 1, 1,   // Top-left
            1, 0, 1, 0, 0,   // Bottom-right
            0, 1, 1, 1, 1,   // Top-left
            1, 1, 1, 0, 1    // Top-right
        ]);
    
        // Top face
        allverts = allverts.concat([
            0, 1, 0, 0, 0,   // Top-left front
            1, 1, 0, 1, 0,   // Top-right front
            1, 1, 1, 1, 1,   // Top-right back
            0, 1, 0, 0, 0,   // Top-left side
            1, 1, 1, 1, 1,   // Top-right back
            0, 1, 1, 0, 1    // Top-left back
        ]);
    
        // Bottom face
        allverts = allverts.concat([
            0, 0, 1, 0, 0,   // Bottom-left back
            1, 0, 1, 1, 0,   // Bottom-right back
            1, 0, 0, 1, 1,   // Bottom-right side
            0, 0, 1, 0, 0,   // Bottom-left back
            1, 0, 0, 1, 1,   // Bottom-right side
            0, 0, 0, 0, 1    // Bottom-left side
        ]);
    
        // Right face
        allverts = allverts.concat([
            1, 0, 0, 0, 0,   // Bottom-right side
            1, 0, 1, 1, 0,   // Bottom-right back
            1, 1, 1, 1, 1,   // Top-right back
            1, 0, 0, 0, 0,   // Bottom-right side
            1, 1, 1, 1, 1,   // Top-right back
            1, 1, 0, 0, 1    // Top-right side
        ]);
    
        // Left face
        allverts = allverts.concat([
            0, 0, 1, 0, 0,   // Bottom-left back
            0, 0, 0, 1, 0,   // Bottom-left side
            0, 1, 0, 1, 1,   // Top-left side
            0, 0, 1, 0, 0,   // Bottom-left back
            0, 1, 0, 1, 1,   // Top-left side
            0, 1, 1, 0, 1    // Top-left back
        ]);
    
        drawTriangle3D2(allverts);
    
    }
}
