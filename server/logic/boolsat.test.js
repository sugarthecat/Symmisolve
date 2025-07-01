import { describe } from 'node:test';
import testCNFValidation from './testSuites/testCNFValidation.test.js';
import testCNFParsing from './testSuites/testCNFParsing.test.js';
import testCNFReduction from './testSuites/testCNFReduction.test.js';

describe('CNF Validation', testCNFValidation);

describe('CNF Parsing', testCNFParsing);

describe('CNF reduction', testCNFReduction);
