class Cone {
    constructor(height, radius, segments) {
        this.type = "cone";
        this.color = [0.6, 0.6, 0.6, 1]; 
        this.matrix = new Matrix4(); 
        this.height = height;
        this.radius = radius;
        this.segments = segments; 
    }

    generateVertices() {
        let vertices = [];
        const angleStep = (Math.PI * 2) / this.segments;

        // Apex of the cone
        const apex = [0, this.height, 0];

        for (let i = 0; i < this.segments; i++) {
            let angle = i * angleStep;
            let nextAngle = (i + 1) * angleStep;

            let x1 = this.radius * Math.cos(angle);
            let z1 = this.radius * Math.sin(angle);
            let x2 = this.radius * Math.cos(nextAngle);
            let z2 = this.radius * Math.sin(nextAngle);

            vertices.push(...apex);
            vertices.push(x1, 0, z1);
            vertices.push(x2, 0, z2);
        }

        return vertices;
    }

    render() {
        const vertices = this.generateVertices();

        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        for (let i = 0; i < vertices.length; i += 9) {
            drawTriangle3D(vertices.slice(i, i + 9));
        }
    }
}
