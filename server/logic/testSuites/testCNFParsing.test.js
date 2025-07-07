import { it } from "node:test";
import assert from 'node:assert/strict';
import { parseCNF } from "../boolsat.js";

const testCNFParsing = () => {
    it('It should throw an error on an invalid CNF', () => {
        assert.throws(() => { parseCNF('') });
        assert.throws(() => { parseCNF('c hey! this is a comment') });
        assert.throws(() => { parseCNF('c hey! this is a comment\nc a multiple line comment :)') });
        assert.throws(() => { parseCNF('p cnf 1 3\n1 2 0\n1 -2 0\n-1 0') });
    })
    it('It should parse formulas correctly', () => {
        assert.deepEqual(parseCNF('p cnf 2 3\n1 2 0\n1 -2 0\n-1 0'), [[1, 2], [1, -2], [-1]]);
        assert.deepEqual(parseCNF('p cnf 1 2\n1 0\n-1 0'), [[1], [-1]]);
        assert.deepEqual(parseCNF('p cnf 1 0\n0'), [[]]);
    })
    it('It should parse large formulas correctly', () => {
        assert.deepEqual(
            parseCNF(
                'c Pidgeonhole Principle (2 pidgeons, 3 holes)\n' +
                'p cnf 6 9\n' +
                '1 2 0\n' +
                '3 4 0\n' +
                '5 6 0\n' +
                '-1 -3 0\n' +
                '-1 -5 0\n' +
                '-3 -5 0\n' +
                '-2 -4 0\n' +
                '-2 -6 0\n' +
                '-4 -6 0\n'
            ),
            [[1, 2], [3, 4], [5, 6], [-1, -3], [-1, -5], [-3, -5], [-2, -4], [-2, -6], [-4, -6]]);
        assert.deepEqual(
            parseCNF(
                'c Pidgeonhole Principle (3 pidgeons, 3 holes)\n' +
                'p cnf 9 12\n' +
                '1 2 3 0\n' +
                '4 5 6 0\n' +
                '7 8 9 0\n' +
                '-1 -4 0\n' +
                '-1 -7 0\n' +
                '-4 -7 0\n' +
                '-2 -5 0\n' +
                '-2 -8 0\n' +
                '-5 -8 0\n' +
                '-3 -6 0\n' +
                '-3 -9 0\n' +
                '-6 -9 0\n'
            ),
            [[1, 2, 3], [4, 5, 6], [7, 8, 9], [-1, -4], [-1, -7], [-4, -7], [-2, -5], [-2, -8], [-5, -8], [-3, -6], [-3, -9], [-6, -9]]);
    })

}
export default testCNFParsing
