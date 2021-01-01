/**
 * @class MyCurveAnimation
 * Piece movement animation
 */
// TODO REMOVE OBJECT
class MyCurveAnimation extends MyKeyframeAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene the scene object
     * @param {Number} xOffset
     * @param {Number} zOffset
     * @param {Object} object the animation object
     * @param {Number} speed the speed of the animation
     * @param {Number} frameNum the number of frames of the animation
     */
    constructor(scene, currentTime, xOffset, zOffset, object, speed, frameNum) {        
        const initTransformationObj = function (translation) {
            let transformationObj = {};
            transformationObj['translation'] = { ...translation };
            return transformationObj;
        }
        
        const calculateKeyframeArray = function () {
            let xOffsetDelta = 0, zOffsetDelta = 0;
            let keyframes = [];

            let radius = Math.sqrt(xOffset * xOffset + zOffset * zOffset) / 2;
            let duration = (Math.PI * radius) / speed;

            let initialTime = currentTime;
            let finalTime = initialTime + duration;
            let timeOffset = (finalTime - initialTime) / frameNum;
            let time = initialTime;

            zOffsetDelta = (zOffset) / frameNum;
            xOffsetDelta = (xOffset) / frameNum;

            for (let i = 0; i < frameNum; i++) {
                let translation = { x: 0, y: 0, z: 0 };
                translation.x = i * xOffsetDelta ;//- xOffset;
                translation.z = i * zOffsetDelta ;//- zOffset;

                let currentDistance = Math.sqrt(translation.x * translation.x + translation.z * translation.z);

                let distanceFromCenter = radius - currentDistance;
                translation.y = Math.sqrt(radius * radius - distanceFromCenter * distanceFromCenter);

                time = i * timeOffset + initialTime;
                keyframes.push(new Keyframe(time, initTransformationObj(translation)));
            }

            keyframes.push(new Keyframe(finalTime, initTransformationObj({ x: 0, y: 0, z: 0 })));
            return keyframes;
        }

        super(calculateKeyframeArray());
        this.scene = scene;
        this.xOffset = xOffset;
        this.zOffset = zOffset;
        this.object = object;
        this.speed = speed;
        this.frameNum = frameNum;
    }
}