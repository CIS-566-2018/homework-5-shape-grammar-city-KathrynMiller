import Shape from './Shape';
import {vec3, vec4, mat4} from 'gl-matrix';
import Roof1 from './geometry/Roof1';

class Grammar {
    buildings: Set<Shape> = new Set();
    axiom: string;

    // TODO: change to not have axiom but number of buildings and place around grid
    constructor(a: string) {
        this.axiom = a;
        // add base shapes to set of buildings based on axiom characters representing base layout
        for(let i = 0; i < this.axiom.length; i++) {
            let shape = new Shape(this.axiom[i], false, vec3.fromValues(0, 0, 0), 0, vec3.fromValues(1, 1, 1), vec3.fromValues(1, 1, 1), false);
            this.buildings.add(shape);
        }
    }

    // return new set of builings to replace input building 
// terminalXZ based on population density and surface area of roof
// Determine if terminal y based on population density
// If max y, and no roof, add roof
// Terminal if max in all directions then add roof
    divide(oldBuilding: Shape): Set<Shape> {
        let newShapes = new Set<Shape>();
        let r = Math.random();
        // TODO base these on population density and oldBuilding center
        let areaMin = .2;
        let heightMax = 2.5;
        // don't subdivide in x or z, only go up
        if(oldBuilding.getArea() / 2.0 <= areaMin) { // if can't divide by x or z anymore
            if(oldBuilding.getHeight() < heightMax) { // terminal x and z but not max height
                console.log("build height  " + oldBuilding.getColor());
                this.scaleY(oldBuilding);
                newShapes.add(oldBuilding);
                return newShapes; 
            } else { // terminal everywehre
                oldBuilding.makeTerminal();
                newShapes.add(oldBuilding);
                return newShapes;
            }
        } else if (oldBuilding.getHeight() > heightMax) { // can't add in y direction
            console.log("too high  " + oldBuilding.getColor());
            if(r < .5) {
                console.log("divideX  " + oldBuilding.getColor());
                newShapes = this.divideX(oldBuilding);
            } else {
                console.log("divideZ  " + oldBuilding.getColor());
                newShapes = this.divideZ(oldBuilding);
            }
            return newShapes; 
        }  else { // can build in any direction
            if(r < .33) {
                console.log("divideX  " + oldBuilding.getColor());
                newShapes = this.divideX(oldBuilding);
            } else if(r < .67) {
                console.log("divideZ  " + oldBuilding.getColor());
                newShapes = this.divideZ(oldBuilding);
            } else {
                console.log("scaleY  " + oldBuilding.getColor());
                this.scaleY(oldBuilding);
                newShapes.add(oldBuilding);
            }
            return newShapes; 
        } 
    }
    // scales building in y direction
    scaleY(oldBuilding: Shape){
        oldBuilding.scaleY(1.5);
    }

    divideZ(oldBuilding: Shape): Set<Shape> {
        // offset amount from current centers
        let offset = oldBuilding.getScale()[2] / 4.0 + .07;
        let newCenter1 = vec3.fromValues(oldBuilding.getCenter()[0], oldBuilding.getCenter()[1], oldBuilding.getCenter()[2] - offset);
        let newCenter2 = vec3.fromValues(oldBuilding.getCenter()[0], oldBuilding.getCenter()[1], oldBuilding.getCenter()[2] + offset);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0], oldBuilding.getScale()[1], oldBuilding.getScale()[2] / 2.0 - .01);

        let b1 = new Shape("c", false, newCenter1, oldBuilding.getRotation(), newScale, vec3.fromValues(0, 0, 1), oldBuilding.hasRoof());
        let b2 = new Shape("c", false, newCenter2, oldBuilding.getRotation(), newScale, vec3.fromValues(1, 0, 0), oldBuilding.hasRoof());
        let newShapes = new Set<Shape>();
        newShapes.add(b1);
        newShapes.add(b2);
        return newShapes;
    }

    // choose random character to represent different building slices or tops
    divideX(oldBuilding: Shape): Set<Shape> {
        // offset amount from current centers
        let offset = oldBuilding.getScale()[0] / 4.0 + .07;
        let newCenter1 = vec3.fromValues(oldBuilding.getCenter()[0] - offset, oldBuilding.getCenter()[1], oldBuilding.getCenter()[2]);
        let newCenter2 = vec3.fromValues(oldBuilding.getCenter()[0] + offset, oldBuilding.getCenter()[1], oldBuilding.getCenter()[2]);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0] / 2.0 - .01, oldBuilding.getScale()[1], oldBuilding.getScale()[2]);

        let b1 = new Shape("c", false, newCenter1, oldBuilding.getRotation(), newScale, vec3.fromValues(0, 0, 1), false);
        let b2 = new Shape("c", false, newCenter2, oldBuilding.getRotation(), newScale, vec3.fromValues(1, 0, 0), false);
        let newShapes = new Set<Shape>();
        newShapes.add(b1);
        newShapes.add(b2);
        return newShapes;
    }

    addRoof(oldBuilding: Shape): Shape {
        oldBuilding.roof = true;
        let r = Math.random();
        let roof: Shape;
        let newCenter = vec3.fromValues(oldBuilding.getCenter()[0],  oldBuilding.getCenter()[1] + oldBuilding.getScale()[1] / 2, oldBuilding.getCenter()[2]);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0], oldBuilding.getScale()[1] - .5, oldBuilding.getScale()[2])
        if(r < .33) {
            roof = new Shape("r1", true, newCenter, oldBuilding.getRotation(), newScale, oldBuilding.getColor(), true);
        } else if (r < .67) {
            roof = new Shape("r2", true, newCenter, oldBuilding.getRotation(), newScale, oldBuilding.getColor(), true);
        } else {
            roof = new Shape("r3", true, newCenter, oldBuilding.getRotation(), newScale, oldBuilding.getColor(), true);
        }
        return roof;
    }

    getBuildings(): Set<Shape> {
        return this.buildings;
    }

}

export default Grammar;