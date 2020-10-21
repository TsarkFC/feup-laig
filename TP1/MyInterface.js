/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        return true;
    }

    createInterface() {
        // add a group of controls (and open/expand by defult)
        this.gui.add(this.scene, 'selectedCamera', Object.keys(this.scene.cameras)).name('Camera').onChange(this.scene.setSelectedCamera.bind(this.scene));

        const lights = this.scene.graph.lights;
        for (let id in lights){
            this.scene[id] = lights[id][0];

            this.gui.add(this.scene, id).name(id).onChange(this.scene.updateLights.bind(this.scene));
        }
        
        this.initKeys();
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}