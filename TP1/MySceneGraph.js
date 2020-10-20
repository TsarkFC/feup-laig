const DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var VIEWS_INDEX = 1;
var ILLUMINATION_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var NODES_INDEX = 6;

const isNotNull = (v) => v != null;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * Constructor for MySceneGraph class.
     * Initializes necessary variables and starts the XML file reading process.
     * @param {string} filename - File that defines the 3D scene
     * @param {XMLScene} scene
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];
        this.materials = [];
        this.textures = [];
        this.cameras = [];

        this.idRoot = null; // The id of the root element.
        this.objRoot = null;

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lsf")
            return "root tag <lsf> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <initials>
        var index;
        if ((index = nodeNames.indexOf("initials")) == -1)
            return "tag <initials> missing";
        else {
            if (index != INITIALS_INDEX)
                this.onXMLMinorError("tag <initials> out of order " + index);

            //Parse initials block
            if ((error = this.parseInitials(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }

        // <illumination>
        if ((index = nodeNames.indexOf("illumination")) == -1)
            return "tag <illumination> missing";
        else {
            if (index != ILLUMINATION_INDEX)
                this.onXMLMinorError("tag <illumination> out of order");

            //Parse illumination block
            if ((error = this.parseIllumination(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }

        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <nodes>
        if ((index = nodeNames.indexOf("nodes")) == -1)
            return "tag <nodes> missing";
        else {
            if (index != NODES_INDEX)
                this.onXMLMinorError("tag <nodes> out of order");

            //Parse nodes block
            if ((error = this.parseNodes(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <initials> block. 
     * @param {initials block element} initialsNode
     */
    parseInitials(initialsNode) {
        var children = initialsNode.children;
        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var rootIndex = nodeNames.indexOf("root");
        var referenceIndex = nodeNames.indexOf("reference");

        // Get root of the scene.
        if(rootIndex == -1)
            return "No root id defined for scene.";

        var rootNode = children[rootIndex];
        var id = this.reader.getString(rootNode, 'id');
        if (id == null)
            return "No root id defined for scene.";

        this.idRoot = id;

        // Get axis length        
        if(referenceIndex == -1)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        var refNode = children[referenceIndex];
        var axis_length = this.reader.getFloat(refNode, 'length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed initials");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseViews(viewsNode) {
        const children = viewsNode.children;
        const defaultCameraId = this.reader.getString(viewsNode, 'default');
        if (!isNotNull(defaultCameraId))
            return "No default camera set";

        for (let child of children) {
            const grandChildren = child.children;

            const cameraId = this.reader.getString(child, 'id');
            if (!isNotNull(cameraId))
                continue;

            if (this.cameras[cameraId] != null)
                return "ID must be unique for each camera (conflict: ID = " + cameraId + ")";


            const cameraNF = this.getFloatParameters(child, ['near', 'far']);
            if (!isNotNull(cameraNF))
                continue;

            
            if (child.nodeName === "perspective") {
                const cameraAngle = this.getFloatParameter(child, 'angle');
                if (!isNotNull(cameraAngle))
                    continue;
                
                let toObj = null, fromObj = null;

                for (child of grandChildren) {
                    if (child.nodeName === "to" && toObj === null) {
                        toObj = child;
                    } else if (child.nodeName === "from" && fromObj === null) {
                        fromObj = child;
                    } else {
                        this.onXMLMinorError("Duplicate or invalid node inside perspective camera");
                    }
                }

                if (!isNotNull(toObj) || !isNotNull(fromObj)) {
                    continue;
                }

                const xyz = ['x', 'y', 'z'];
                const cameraTo = this.getFloatParameters(toObj, xyz);
                const cameraFrom = this.getFloatParameters(fromObj, xyz);

                if (!isNotNull(cameraTo) || !isNotNull(cameraFrom)) 
                    continue;

                this.scene.addCamera(cameraId, new CGFcamera(cameraAngle * DEGREE_TO_RAD, cameraNF.near, cameraNF.far, vec3.fromValues(cameraFrom.x, cameraFrom.y, cameraFrom.z), vec3.fromValues(cameraTo.x, cameraTo.y, cameraTo.z)));
            } else if (child.nodeName === "ortho") {
                const cameraLRTB = this.getFloatParameters(child, ['left', 'right', 'top', 'bottom']);
                if (!isNotNull(cameraLRTB))
                    continue;
                
                let toObj = null, fromObj = null, upObj = null;

                for (child of grandChildren) {
                    if (child.nodeName === "to" && toObj === null) {
                        toObj = child;
                    } else if (child.nodeName === "from" && fromObj === null) {
                        fromObj = child;
                    } else if (child.nodeName === "up" && upObj === null) {
                        upObj = child;
                    } else {
                        this.onXMLMinorError("Duplicate or invalid node inside ortho camera");
                    }
                }

                if (!isNotNull(toObj) || !isNotNull(fromObj)) {
                    continue;
                }

                const xyz = ['x', 'y', 'z'];
                const cameraTo = this.getFloatParameters(toObj, xyz);
                const cameraFrom = this.getFloatParameters(fromObj, xyz);
                let cameraUp = null;
                if (isNotNull(upObj)) cameraUp = this.getFloatParameters(upObj, xyz);

                if (!isNotNull(cameraTo) || !isNotNull(cameraFrom))  {
                    continue;
                }

                this.scene.addCamera(cameraId, new CGFcameraOrtho(cameraLRTB.left, cameraLRTB.right, cameraLRTB.bottom, cameraLRTB.top, cameraNF.near, cameraNF.far, vec3.fromValues(cameraFrom.x, cameraFrom.y, cameraFrom.z), vec3.fromValues(cameraTo.x, cameraTo.y, cameraTo.z), cameraUp === null ? null : vec3.fromValues(cameraUp.x, cameraUp.y, cameraUp.z)));
            } else {
                this.onXMLMinorError("Invalid node in 'views' node.");
            }
        }
            

        if (!isNotNull(this.scene.cameras[defaultCameraId])) 
            return "There is no camera with id equal to the default camera id.";

        this.scene.selectedCamera = defaultCameraId;
        this.scene.setSelectedCamera();
        console.log("Parsed Views");
        return null;
    }

    /**
     * Parses the <illumination> node.
     * @param {illumination block element} illuminationsNode
     */
    parseIllumination(illuminationsNode) {

        var children = illuminationsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed Illumination.");
        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "light") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["enable", "position", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["boolean","position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "boolean")
                        var aux = this.parseBoolean(grandChildren[attributeIndex], "value", "enabled attribute for light of ID" + lightId);
                    else if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (typeof aux === 'string')
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }
            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL
        //this.onXMLMinorError("To do: Parse textures.");
        var children = texturesNode.children;

        for (const tex of children) {

            if (tex.nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + tex.nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var textureID = this.reader.getString(tex, 'id');
            if (textureID == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.textures[textureID] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureID + ")";

            //Continue here
            var path = this.reader.getString(tex, 'path');
            if (path == null)
                return "no path defined for texture";
            
            const texture = new CGFtexture(this.scene, path);
            this.textures[textureID] = texture;

        }

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            //Continue here
            
            const material = new CGFappearance(this.scene);
            material.setTextureWrap('REPEAT', 'REPEAT');
            grandChildren = children[i].children;

            for (let child of grandChildren) {
                if (child.nodeName === "shininess") {
                    const res = this.getFloatParameter(child, 'value');
    
                    if (isNotNull(res)) {
                        material.setShininess(res);
                    }
                } else if (child.nodeName === "ambient") {
                    const params = ['r', 'g', 'b', 'a'];
        
                    const res = this.getFloatParameters(child, params);
    
                    if (isNotNull(res)) {
                        material.setAmbient(res.r, res.g, res.b, res.a);
                    }
                } else if (child.nodeName === "diffuse") {    
                    
                    const params = ['r', 'g', 'b', 'a'];
        
                    const res = this.getFloatParameters(child, params);
    
                    if (isNotNull(res)) {
                        material.setDiffuse(res.r, res.g, res.b, res.a);
                    }
                } else if (child.nodeName === "specular") {    
                    
                    const params = ['r', 'g', 'b', 'a'];
        
                    const res = this.getFloatParameters(child, params);
    
                    if (isNotNull(res)) {
                        material.setSpecular(res.r, res.g, res.b, res.a);
                    }
                } else if (child.nodeName === "emissive") {    
                    
                    const params = ['r', 'g', 'b', 'a'];
        
                    const res = this.getFloatParameters(child, params);
    
                    if (isNotNull(res)) {
                        material.setEmission(res.r, res.g, res.b, res.a);
                    }
                } else {
                    this.onXMLMinorError("Child of 'transformations' node has got an invalid nodeName.");
                }
            }

            this.materials[materialID] = material;
        }

        //this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <nodes> block.
     * @param {nodes block element} nodesNode
     */
    parseNodes(nodesNode) {
        var children = nodesNode.children;

        this.nodes = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];


        this.onXMLMinorError("Incomplete: parse nodes");

        // Any number of nodes.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "node") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current node.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null)
                return "no ID defined for nodeID";

            // Checks for repeated IDs.
            if (this.nodes[nodeID] != null)
                return "ID must be unique for each node (conflict: ID = " + nodeID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            this.nodes[nodeID] = this.parseNode(children[i], nodeNames, grandChildren);
        }


        let unmatchedIds = [];
        for (let n in this.nodes) {
            unmatchedIds = unmatchedIds.concat(this.nodes[n].correspondIdsToObjects(this.nodes));
        }
        unmatchedIds = unmatchedIds.filter((val, idx, arr) => {
            return arr.indexOf(val) === idx;
        });          
        
        if (unmatchedIds.length) this.onXMLMinorError("the following ids are referenced but do not have a correspondent node: " + unmatchedIds.join());

        this.objRoot = this.nodes[this.idRoot];
    }

    parseNode(nodeBlock, nodeChildrenNames, nodeChildren) {
        var transformationsIndex = nodeChildrenNames.indexOf("transformations");
        var materialIndex = nodeChildrenNames.indexOf("material");
        var textureIndex = nodeChildrenNames.indexOf("texture");
        var descendantsIndex = nodeChildrenNames.indexOf("descendants");

        const node = new IntermediateNode(nodeBlock.nodeName, this.scene);

        // Transformations
        if (transformationsIndex != -1) {
            const transformationsNode = nodeChildren[transformationsIndex];
            const transformations = transformationsNode.children;

            const tmat = this.parseTransformations(transformations);
            node.setTransformationMatrix(tmat);
        }

        // Material

        const materialNode = nodeChildren[materialIndex];
        var matID = this.reader.getString(materialNode, 'id');
        if (matID == null)
            this.onXMLMinorError("no id defined for material");
        if (matID == "null") {
            node.setMaterial("null");
        } else if (this.materials[matID] != undefined) {
            node.setMaterial(this.materials[matID]);
        } else {
            this.onXMLMinorError("referenced texture id " + matID + "isn't defined");
        }


        // Texture

        const textureNode = nodeChildren[textureIndex];

        if (textureNode.children.length == 0) {
            this.onXMLMinorError("no amplification defined for texture"); //uncomment when xml ready
        } else {
            const amplificationNode = textureNode.children[0];
            if (amplificationNode.nodeName != "amplification") {
                this.onXMLMinorError("invalid node name inside texture of node");
            } else {
                const amplification = this.getFloatParameters(textureNode.children[0], ['afs', 'aft']);
                if (amplification === null) {
                    this.onXMLMinorError("invalid amplification parameters inside texture of node");
                } else {
                    node.setScaleFactors({ afs: amplification.afs, aft: amplification.aft });
                    //console.log("Amplification", amplification);
                }

            }
        }

        var texID = this.reader.getString(textureNode, 'id');
        if (texID == null)
            this.onXMLMinorError("no id defined for material");
        if (texID == "clear") {
            node.setTexture(texID);
        } else if (texID == "null") {
            node.setTexture(texID);
        } else {
            if (this.textures[texID] != undefined) {
                node.setTexture(this.textures[texID]);
            } else {
                this.onXMLMinorError("referenced texture id " + texID + "isn't defined");
            }
        }


        // Descendants
        const descendantsNode = nodeChildren[descendantsIndex];
        const descendantCount = this.parseDescendants(descendantsNode.children, node);

        if (descendantCount <= 0) {
            this.onXMLMinorError("node with id " + this.reader.getString(nodeBlock, 'id') + " has no descendants");
            return null;
        }

        return node;
    }

    parseDescendants(descendants, node) {
        let descendantCount = 0;

        for (let child of descendants) {
            if (child.nodeName === "noderef") {
                let noderefID = this.reader.getString(child, 'id');
                if (noderefID == null) {
                    this.onXMLMinorError("noderef hasn't got id");
                    continue;
                }
                
                node.addDescendantId(noderefID);

            } else if (child.nodeName === "leaf") {
                const leafObj = this.parseLeafNode(child, node);
                if (leafObj == null) continue;

                node.addDescendantObj(new LeafNode(this.scene, leafObj));

            } else {
                this.onXMLMinorError("unknown tag <" + child.nodeName + "> inside descendants of node with id " + this.reader.getString(children[i], 'id'));
                continue;
            }
            descendantCount++;
        }
        return descendantCount;
    }

    parseTransformations(transformations) {
        let transfMx = mat4.create();
        let hadTransformation = false;
        for (let child of transformations) {
            if (child.nodeName === "scale") {
                const params = ['sx', 'sy', 'sz'];

                const res = this.getFloatParameters(child, params);

                if (isNotNull(res)) {
                    mat4.scale(transfMx, transfMx, [res.sx, res.sy, res.sz]);
                    hadTransformation = true;
                }
            } else if (child.nodeName === "translation") {
                const params = ['x', 'y', 'z'];
    
                const res = this.getFloatParameters(child, params);

                if (isNotNull(res)) {
                    mat4.translate(transfMx, transfMx, [res.x, res.y, res.z]);
                    hadTransformation = true;
                }
            } else if (child.nodeName === "rotation") {    
                const angle = this.getFloatParameter(child, 'angle');
                const axis = this.getCharParameter(child, 'axis');

                if (this.axisCoords[axis] == undefined) {
                    this.onXMLMinorError("Rotation child of 'transformations' node has invalid axis.");
                } else if (isNotNull(angle) && isNotNull(axis)) {
                    mat4.rotate(transfMx, transfMx, angle*DEGREE_TO_RAD, this.axisCoords[axis]);
                    hadTransformation = true;
                }
            } else {
                this.onXMLMinorError("Child of 'transformations' node has got an invalid nodeName.");
            }
        }
        return hadTransformation ? transfMx : null;
    }

    /**
     * Generates the primitive for the leaf node
     * @param node the leaf node
     */
    parseLeafNode(node, parent) {
        const leafType = this.reader.getString(node, 'type');
        if (leafType == null) {
            this.onXMLMinorError("no type defined for leaf");
            return null;
        }

        const generatePrimitive = leafObjGenerator[leafType];
        if (generatePrimitive === undefined) {
            this.onXMLMinorError("the leaf type " + leafType + " is not implemented");
            return null;
        }

        return generatePrimitive(this, node, parent);
    }

    /**
     * @param node the node to get the parameter from
     * @param {string} parameter the parameter's name 
     */
    getCharParameter(node, parameter) {
        const value = this.reader.getString(node, parameter);
        if (!isNotNull(value)) {
            this.onXMLMinorError('no ' + parameter + ' defined');
            return null;
        }
        return value[0];
    }

    /**
     * @param node the node to get the parameter from
     * @param {string} parameter the parameter's name
     */
    getFloatParameter(node, parameter) {
        const value = this.reader.getFloat(node, parameter);
        if (!isNotNull(value)) {
            this.onXMLMinorError('no ' + parameter + ' defined for ' + node.nodeName);
            return null;
        } else if (isNaN(value)) {
            this.onXMLMinorError('parameter ' + parameter + ' of ' + node.nodeName + ' is not a valid float');
            return null;
        }
        return value;
    }

    /**
     * @param node the node to get the parameters from
     * @param {array} parameters array with parameter names
     */
    getFloatParameters(node, parameters) {
        const res = [];
        for (const p of parameters) {
            res[p] = this.getFloatParameter(node, p);
            if (!isNotNull(res[p]) || isNaN(res[p])) return null;
        }
        return res;
    }

    parseBoolean(node, name, messageError){
        var boolVal = true;
        boolVal = this.reader.getBoolean(node, name);
        if (!(boolVal != null && !isNaN(boolVal) && (boolVal == true || boolVal == false)))
            this.onXMLMinorError("unable to parse value component " + messageError + "; assuming 'value = 1'");

        return boolVal || 1;
    }
    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.objRoot.display();
    }
}