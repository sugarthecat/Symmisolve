import { it } from "node:test";
import assert from "node:assert/strict";
import { optimizeCNF } from "../boolsat.js";

const testCNFOptimization = () => {
    //TODO add symmetry breaking procedures
    it("Solves the pidgeonhole principle (2 pigeons, 1 hole)", () => {
        //pidgeonhole principle of 2 pidgeons in 1 hole
        assert.deepEqual(
            optimizeCNF([
                [1],
                [2],
                [-1,-2]
            ]),
            [[]]
        );
    });
    it.skip("Solves the pidgeonhole principle (3 pigeons, 2 holes)", () => {
        //pidgeonhole principle of 3 pidgeons in 2 holes
        assert.deepEqual(
            optimizeCNF([
                [1, 2],
                [3, 4],
                [5, 6],
                [-1, -3],
                [-1, -5],
                [-3, -5],
                [-2, -4],
                [-2, -6],
                [-4, -6],
            ]),
            [[]]
        );
    });
    it.skip("Solves the pidgeonhole principle (3 pigeons, 2 holes, pigeon 1 and 2 can share hole 1)", () => {
        //pidgeonhole principle of 3 pidgeons in 2 holes
        assert.deepEqual(
            optimizeCNF([
                [1, 2],
                [3, 4],
                [5, 6],
                [-1, -5],
                [-3, -5],
                [-2, -4],
                [-2, -6],
                [-4, -6],
            ]),
            [[1],[-2],[3],[-4],[-5],[6]]
        );
    });
    it("Solves Transitivity problems", () => {
        //a = b, b = c, a != c has a contradiction
        assert.deepEqual(
            optimizeCNF([
                [1, -2],
                [-1, 2],
                [2, -3],
                [-2, 3],
                [1, 3],
                [-1, -3],
            ]),
            [[]]
        );
        //a != b, b != c, a != c has a contradiction
        assert.deepEqual(
            optimizeCNF([
                [1, 2],
                [-1, -2],
                [2, 3],
                [-2, -3],
                [1, 3],
                [-1, -3],
            ]),
            [[]]
        );
    });
    it("Solves Horn-SAT problems", () => {
        assert.deepEqual(optimizeCNF([[1, -2], [2]]), [[1], [2]]);
        assert.deepEqual(optimizeCNF([[-1, 2], [-2]]), [[-1], [-2]]);
    });
    it("Can initiate positive assumptions", () => {
        assert.deepEqual(optimizeCNF([[1, 2]]), [[1], [2]]);
    });

    it("It should not alter an empty formula, or a false formula", () => {
        assert.deepEqual(optimizeCNF([]), []);
        assert.deepEqual(optimizeCNF([[]]), [[]]);
    });
    it("It should merge any number of resolving clauses", () => {
        assert.deepEqual(optimizeCNF([[1], [-1]]), [[]]);
        assert.deepEqual(optimizeCNF([[1, -2], [1, 2], [-1]]), [[]]);
        assert.deepEqual(
            optimizeCNF([
                [1, -2],
                [1, 2],
                [-1, 3],
                [-1, -3],
            ]),
            [[]]
        );
        assert.deepEqual(
            optimizeCNF([
                [1, -2, 4],
                [1, 2, 4],
                [1, 3, -4],
                [1, -3, -4],
            ]),
            [[1]]
        );
        assert.deepEqual(
            optimizeCNF([
                [-1, 2],
                [-2, 3],
                [1, -3],
                [1, 2, 3],
                [-1, -2, -3],
            ]),
            [[]]
        );
    });
    it("It should be able to remove duplicates", () => {
        assert.deepEqual(optimizeCNF([[1], [1], [1], [1]]), [[1]]);
    });
    it("It should be able to remove subclauses", () => {
        assert.deepEqual(optimizeCNF([[1], [1, 2, 3], [1, 4, 2], [1, 4, 6]]), [[1]]);
        assert.deepEqual(optimizeCNF([[1, 2, 3], [1, 4, 2], [1], [1, 4, 6]]), [[1]]);
    });
    it("It should sort clauses lexically", () => {
        assert.deepEqual(optimizeCNF([[-1, -7], [-1, 5], [-1, 6], [1]]), [[1], [5], [6], [-7]]);
    });
    it("It should remove tautological clauses", () => {
        assert.deepEqual(optimizeCNF([[-1, 1]]), []);
        assert.deepEqual(optimizeCNF([[12, 3, 9, -1, 23, 1, 2], [7]]), [[7]]);
    });
};

export default testCNFOptimization;
