import { it } from "node:test";
import assert from "node:assert/strict";
import { sortClauses, verifyPartialAssignment } from "../boolsat.js";
const testVerifyAssignment = () => {
    it("Accepts all assignments on an empty formula", () => {
        assert.equal(verifyPartialAssignment(sortClauses([]), [1]), true);
        assert.equal(verifyPartialAssignment(sortClauses([]), [-1, 2, 3]), true);
        assert.equal(verifyPartialAssignment(sortClauses([]), [7, 8, 19]), true);
    });
    it("Rejects false unit assignments", () => {
        assert.equal(verifyPartialAssignment(sortClauses([[1]]), [-1]), false);
        assert.equal(verifyPartialAssignment(sortClauses([[2], [3], [4]]), [3, -2, 4]), false);
        assert.equal(verifyPartialAssignment(sortClauses([[-19], [7], [3]]), [7, 8, 19]), false);
    });
    it("Accepts valid partial solves", () => {
        assert.equal(verifyPartialAssignment(sortClauses([[1,2],[-1,-2]]), [-1,2]), true);
        assert.equal(verifyPartialAssignment(sortClauses([[1,2,3],[-1,-2,-3],]), [-3,2]), true);
    });

    it("Rejects invalid partial solves", () => {
        assert.equal(verifyPartialAssignment(sortClauses([[1,2,3],[-1,-2,-3],[4],[-5]]), [1,2]), false);
    });
};

export default testVerifyAssignment;
