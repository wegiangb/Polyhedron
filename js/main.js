var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var material = new THREE.MeshLambertMaterial({ 
	// wireframe: true,
	// side: THREE.DoubleSide,
	shading: THREE.FlatShading,
	vertexColors: THREE.FaceColors
});

var mesh = new Mesh(Dodecahedron.vertices, Dodecahedron.faces);

var parent = new THREE.Object3D();
var child;

scene.add(parent);

function updateMesh() {
	parent.remove(child);

	var geometry = new THREE.Geometry();

	for (var i = 0; i < mesh.vertices.length; ++i) {
		geometry.vertices.push(mesh.vertices[i]);
	}

	for (var i = 0; i < mesh.faces.length; ++i) {
		var f = mesh.faces[i];

		for (var j = 0; j < f.corners.length - 2; ++j) {
			geometry.faces.push(new THREE.Face3(f.corners[0], f.corners[1+j], f.corners[2+j], f.normal, mesh.getColor(f)));
		}
	}

	child = new THREE.Mesh(geometry, material);
	parent.add(child);
}

updateMesh();

var light = new THREE.DirectionalLight(0x777777);
light.position.set(0,1,1);

var ambient = new THREE.AmbientLight(0x444444);
// var ambient = new THREE.AmbientLight(0xffffff);

scene.add(light);
scene.add(ambient);

camera.position.z = 4;

var render = function () {
	renderer.render(scene, camera);
	requestAnimationFrame(render);
};

render();

var dragTreshhold = 0.01;
var drag = false;
var mouseDown = false;
var x, y;

document.onkeydown = function(e) {
	switch (e.which) {
		case 187: mesh.subdivide(); updateMesh(); break;
		case 189: mesh.merge(); updateMesh(); 	break;
	}
};

document.onmousedown = function(e) {
	mouseDown = true;

	x = e.x;
	y = e.y;
};

var projector = new THREE.Projector();
var mouseVector = new THREE.Vector3();

document.onmouseup = function(e) {
	if (!drag) {
		mouseVector.x = 2 * (e.x / window.innerWidth) - 1;
		mouseVector.y = 1 - 2 * (e.y / window.innerHeight);

		var raycaster = projector.pickingRay(mouseVector.clone(), camera);
		var intersectedObjects = raycaster.intersectObjects(parent.children);

		if (intersectedObjects.length > 0) {
			var nearestHiddenFace = intersectedObjects[0].face;
			mesh.selectFaces([nearestHiddenFace.a, nearestHiddenFace.b, nearestHiddenFace.c]);

			updateMesh();
		}
	}

	mouseDown = false;
	drag = false;
};

document.onmousemove = function(e) {
	if (!mouseDown) { return }

	var deltaX = e.x - x;
	var deltaY = e.y - y;

	if (!drag && (Math.abs(deltaX) + Math.abs(deltaY) <= dragTreshhold)) { return; }

	drag = true;

	x = e.x;
	y = e.y;

	var q = new THREE.Quaternion();

	q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
	parent.quaternion.multiplyQuaternions(q, parent.quaternion);

	q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.005);
	parent.quaternion.multiplyQuaternions(q, parent.quaternion);
};

