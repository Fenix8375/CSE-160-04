class Camera {
    constructor(canvas) {
        this.fov = 100; // Field of view
        this.eye = new Vector3([0, 1.5, 1]); // Camera position
        this.at = new Vector3([0, 0, 0]); // Target position (what camera is looking at)
        this.up = new Vector3([0, 1, 0]); // Up direction

        // View and Projection Matrices
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();

        this.updateViewMatrix();
        this.updateProjectionMatrix(canvas);
    }

    
    pan(deltaX, deltaY) {
        g_camera.panLeft(-deltaX * 0.5);
        let upDownRotationMatrix = new Matrix4().setRotate(-deltaY * 0.1, 1, 0, 0); 
        let f = new Vector3(this.at.elements).sub(this.eye);
        let rotatedF = upDownRotationMatrix.multiplyVector3(f);
        this.at.set(rotatedF.add(this.eye));
        this.updateViewMatrix();
    }


    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
            this.at.elements[0], this.at.elements[1], this.at.elements[2], 
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    updateProjectionMatrix(canvas) {
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }

    moveForward(speed = 0.1) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateViewMatrix();
    }

    moveBackwards(speed = 0.1) {
        let f = new Vector3(this.eye.elements);
        f.sub(this.at);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateViewMatrix();
    }

    moveLeft(speed = 0.1) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.sub(s);
        this.at.sub(s);
        this.updateViewMatrix();
    }

    moveRight(speed = 0.1) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    panLeft(alpha = 2.0) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4().setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let rotatedF = rotationMatrix.multiplyVector3(f);
        this.at.set(rotatedF.add(this.eye));
        this.updateViewMatrix();
    }

    panRight(alpha = -2.0) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4().setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let rotatedF = rotationMatrix.multiplyVector3(f);
        this.at.set(rotatedF.add(this.eye));
        this.updateViewMatrix();
    }
}
