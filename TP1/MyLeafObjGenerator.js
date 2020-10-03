
function getRectanglePrimitive(scene, reader, node) {
    const x1 = reader.getFloat(node, 'x1');
    if (x1 == null) {
        this.onXMLMinorError("no x1 defined for rectangle primitive");
        return null;
    }
    const y1 = reader.getFloat(node, 'y1');
    if (y1 == null) {
        this.onXMLMinorError("no y1 defined for rectangle primitive");
        return null;
    }
    const x2 = reader.getFloat(node, 'x2');
    if (x2 == null) {
        this.onXMLMinorError("no x2 defined for rectangle primitive");
        return null;
    }
    const y2 = reader.getFloat(node, 'y2');
    if (y2 == null) {
        this.onXMLMinorError("no y2 defined for rectangle primitive");
        return null;
    }
    return new MyRectangle(scene, x1, y1, x2, y2);
}

function getTorusPrimitive(scene, reader, node) {
    const inner = reader.getFloat(node, 'inner');
    if (inner == null) {
        this.onXMLMinorError("no inner defined for torus primitive");
        return null;
    }
    const outer = reader.getFloat(node, 'outer');
    if (outer == null) {
        this.onXMLMinorError("no outer defined for torus primitive");
        return null;
    }
    const slices = reader.getFloat(node, 'slices');
    if (slices == null) {
        this.onXMLMinorError("no slices defined for torus primitive");
        return null;
    }
    const loops = reader.getFloat(node, 'loops');
    if (loops == null) {
        this.onXMLMinorError("no loops defined for torus primitive");
        return null;
    }
    return new MyTorus(scene, inner, outer, slices, loops);
}

function getCylinderPrimitive(scene, reader, node) {
    const height = reader.getFloat(node, 'height');
    if (height == null) {
        this.onXMLMinorError("no height defined for cylinder primitive");
        return null;
    }
    const topRadius = reader.getFloat(node, 'topRadius');
    if (topRadius == null) {
        this.onXMLMinorError("no topRadius defined for cylinder primitive");
        return null;
    }
    const bottomRadius = reader.getFloat(node, 'bottomRadius');
    if (bottomRadius == null) {
        this.onXMLMinorError("no bottomRadius defined for cylinder primitive");
        return null;
    }
    const stacks = reader.getFloat(node, 'stacks');
    if (stacks == null) {
        this.onXMLMinorError("no stacks defined for cylinder primitive");
        return null;
    }
    const slices = reader.getFloat(node, 'slices');
    if (slices == null) {
        this.onXMLMinorError("no slices defined for cylinder primitive");
        return null;
    }
    return new MyCylinder(scene, height, topRadius, bottomRadius, stacks, slices);
}

function getPlaceHolderPrimitive(type) {
    console.warn("Placeholder of type " + type + " created.")
    return new PrimitivePlaceHolder();
}

const leafObjGenerator = {
    rectangle: getRectanglePrimitive,
    torus: getTorusPrimitive,
    cylinder: getCylinderPrimitive,
    triangle: () => getPlaceHolderPrimitive("triangle"),
    sphere: () => getPlaceHolderPrimitive("sphere")
}
