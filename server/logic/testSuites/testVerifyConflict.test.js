import { it } from "node:test";
import assert from "node:assert/strict";
import { sortClauses, verifyConflict } from "../boolsat.js";
const testVerifyConflict = () => {
    it("Finds conflicts in applied problems", () => {
        //PHP (3 pigeons, 2 holes) should have a conflict, easy
        assert.equal(
            verifyConflict(
                sortClauses([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                    [-1, -3],
                    [-3, -5],
                    [-1, -5],
                    [-2, -4],
                    [-2, -6],
                    [-4, -6],
                ]),
                [1]
            ),
            true
        );
        //1 == 2 == 3 == True shouldnt accept -1
        assert.equal(
            verifyConflict(
                sortClauses([
                    [1, -2],
                    [-1, 2],
                    [2, -3],
                    [-2, 3],
                    [3]
                ]),
                [-1]
            ),
            true
        );
        //1 -> 2 -> 3  should conflict with 1 and -3
        assert.equal(
            verifyConflict(
                sortClauses([
                    [-1, 2],
                    [-2, 3]
                ]),
                [1, -3]
            ),
            true
        );
    });
    it("Does not find conflicts where none exist", () => {
        assert.equal(
            verifyConflict(
                sortClauses([
                    [1]
                ]),
                [1]
            ),
            false
        );
        assert.equal(
            verifyConflict(
                sortClauses([
                    [1, 2, 3],
                    [4, 5, 6],
                ]),
                [1]
            ),
            false
        );
        assert.equal(
            verifyConflict(
                sortClauses([
                    [1, 2, 3],
                    [-1, -2, -3],
                ]),
                [1]
            ),
            false
        );
    });
};

export default testVerifyConflict;
