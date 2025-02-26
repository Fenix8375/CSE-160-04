class Triangle2 {
    constructor(vertices, color) {
        this.type = 'triangle';
        this.vertices = vertices; // Assuming an array of vertex coordinates
        this.color = color; // Color for the triangle
    }

    render() {
        // Set the color uniform
        gl.uniform4fv(u_FragColor, new Float32Array(this.color));

        // Set up and bind vertex data
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
    }
}




function drawTriangle2(vertices, color) {
    var n = vertices.length / 2;  // Number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Set the color for the triangle
    gl.uniform4fv(u_FragColor, new Float32Array(color));

    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
