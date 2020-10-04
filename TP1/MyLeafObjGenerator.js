function getRectanglePrimitive(sceneGraph, node) {
    const params = ['x1', 'y1', 'x2', 'y2'];

    const res = sceneGraph.getFloatParameters(node, params);

    if (isNotNull(res))
        return new MyRectangle(sceneGraph.scene, res.x1, res.y1, res.x2, res.y2);
    return null;
}

function getTorusPrimitive(sceneGraph, node) {
    const params = ['inner', 'outer', 'slices', 'loops'];

    const res = sceneGraph.getFloatParameters(node, params);

    if (isNotNull(res))
        return new MyTorus(sceneGraph.scene, res.inner, res.outer, res.slices, res.loops);
    return null;
}

function getCylinderPrimitive(sceneGraph, node) {
    const params = ['height', 'topRadius', 'bottomRadius', 'stacks', 'slices'];

    const res = sceneGraph.getFloatParameters(node, params);
    
    if (isNotNull(res))
        return new MyCylinder(sceneGraph.scene, res.height, res.topRadius, res.bottomRadius, res.stacks, res.slices);
    return null;
}

function getPlaceHolderPrimitive(type) {
    console.warn("Placeholder of type " + type + " created.");
    return new PrimitivePlaceHolder();
}

const leafObjGenerator = {
    rectangle: getRectanglePrimitive,
    torus: getTorusPrimitive,
    cylinder: getCylinderPrimitive,
    triangle: () => getPlaceHolderPrimitive("triangle"),
    sphere: () => getPlaceHolderPrimitive("sphere")
}
