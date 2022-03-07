export default class Vector {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    length() {
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)
    }

    normalized() {
        const l = this.length()
        return new Vector(this.x/l, this.y/l, this.z/l)
    }

    static Equals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z
    }

    static Distance(a, b) {
        return Math.abs(a.x-b.x) + Math.abs(a.y-b.y) + Math.abs(a.z-b.z) 
    }

    static Direction(from, to) {
        return new Vector(to.x-from.x, to.y-from.y, to.z-from.z)
    }
}