const {
    optimizeCNF,
    parseCNF,
    getSizeCNF,
    CURR_ALGO_VER,
    stringifyCNF,
} = require("../logic/boolsat.js");
const fs = require("fs");
const path = require("path");
const readline = require("node:readline");
const e = require("express");

//readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function getConsoleInput() {
    return new Promise((resolve) => {
        rl.resume();
        rl.question("", (name) => {
            rl.pause();
            resolve(name);
        });
    });
}

const PROBLEM_INPUT_DIR = path.join(__dirname, "benchmark-problems");
const BENCHMARK_OUTPUT_DIR = path.join(__dirname, "benchmark-results");
const TEST_OUTPUT = path.join(__dirname, "benchmark-results");

const data = [];
function runBenchmarkOn(problem, file, directory) {
    let benchmarkTime = Date.now();
    const prevSize = getSizeCNF(problem);
    const optimized = optimizeCNF(problem);
    let isFullyReduced = true;
    let isSatisfaible = true;
    for (const clause of optimized) {
        if(clause.length === 0) {
            isSatisfaible = false
        }
        if (clause.length > 1) {
            isFullyReduced = false;
        }
    }
    const newSize = getSizeCNF(optimized);
    benchmarkTime = Date.now() - benchmarkTime;
    data.push({ prevSize, newSize, benchmarkTime, file, pset: directory, algoVer: CURR_ALGO_VER });

    let problemStatusString = "Indeterminate";
    if(isFullyReduced && isSatisfaible) {
        problemStatusString = "Satisfiable";
    }else if(isFullyReduced && !isSatisfaible) {
        problemStatusString = "Unsatisfiable";
    }
    console.log(`${file}, ${prevSize} -> ${newSize} (${benchmarkTime}ms, ${problemStatusString})`);
}

function runBenchmarkOnPset(pset) {
    console.log("\n-----------  Running benchmark on " + pset + "  -----------\n");
    const BENCHMARK_PSET = path.join(PROBLEM_INPUT_DIR, pset);
    return new Promise((resolve) => {
        fs.readdir(BENCHMARK_PSET, (err, probFiles) => {
            probFiles.forEach((file) => {
                if (!file.endsWith(".cnf")) return;
                try {
                    const data = fs.readFileSync(path.join(BENCHMARK_PSET, file), "utf8");
                    const cnf = parseCNF(data);
                    runBenchmarkOn(cnf, file, pset);
                    resolve();
                } catch (err) {
                    console.error(err);
                }
            });
        });
    });
}

async function getProblemSets() {
    return new Promise((resolve) => {
        fs.readdir(PROBLEM_INPUT_DIR, async (err, localFiles) => {
            let pSets = [];
            for (const localFile of localFiles) {
                //directories are psets
                if (fs.lstatSync(path.join(PROBLEM_INPUT_DIR, localFile)).isDirectory()) {
                    pSets.push(localFile);
                }
            }
            resolve(pSets);
        });
    });
}
async function getProblems(pset) {
    return new Promise((resolve) => {
        fs.readdir(path.join(PROBLEM_INPUT_DIR, pset), async (err, localFiles) => {
            let problemfiles = [];
            for (const localFile of localFiles) {
                //directories are psets
                if (!localFile.endsWith(".cnf")) continue;
                problemfiles.push(localFile);
            }
            resolve(problemfiles);
        });
    });
}

async function runAllBenchmarks() {
    let psets = await getProblemSets();
    for (const pset of psets) {
        await runBenchmarkOnPset(pset);
    }
}

function writeBenchmarkResults() {
    //write results to file
    //make data into a csv
    let csv = "prevSize,newSize,benchmarkTime,file,pset,algoVer\n";
    for (const row of data) {
        csv += `${row.prevSize},${row.newSize},${row.benchmarkTime},${row.file},${row.pset},${row.algoVer}\n`;
    }
    let now = new Date();
    let name = path.join(
        BENCHMARK_OUTPUT_DIR,
        `bench-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}.csv`
    );
    fs.writeFileSync(name, csv, "utf8");
    return name;
}

async function makeChoice(options) {
    for (let i = 0; i < options.length; i++) {
        console.log(`\t(${i + 1}) ${options[i]}`);
    }
    let input = parseInt(await getConsoleInput());
    while (isNaN(input) || input < 1 || input > options.length) {
        console.log(`Invalid input. Please enter a number between 1 and ${psets.length}`);
        input = await getConsoleInput();
    }
    return options[input - 1];
}

rl.on("SIGINT", () => {
    console.log("\nCtrl+C detected. Exiting...");
    rl.close(); // Close the readline interface
    process.exit(0); // Exit the process
});

async function main() {
    console.log("\n\n");
    console.log("Do you want to:");
    console.log("\t(1) Run all benchmarks");
    console.log("\t(2) Benchmark a specific problem set");
    console.log("\t(3) Examine output of reducing a specific problem");
    let input = await getConsoleInput();
    while (!["1", "2", "3", "4"].includes(input)) {
        console.log("Invalid input. Please enter a, b, c, or d");
        input = await getConsoleInput();
    }
    if (input === "1") {
        rl.close();
        await runAllBenchmarks();
    } else if (input === "2") {
        let psets = await getProblemSets();
        console.log("\n");
        console.log("Which problem set do you want to benchmark?");
        console.log("\n");
        let pset = await makeChoice(psets);
        rl.close();
        await runBenchmarkOnPset(pset);
    } else if (input === "3") {
        let psets = await getProblemSets();
        console.log("\n");
        console.log("Which problem set is your problem in?");
        let pset = await makeChoice(psets);
        //now that we have our pset, get which specific problem we want to check
        console.log("\n");
        console.log("Which problem do you want to examine?");
        let problems = await getProblems(pset);
        let pfile = await makeChoice(problems);
        let time = Date.now();
        let problemText = await fs.readFileSync(path.join(PROBLEM_INPUT_DIR, pset, pfile), "utf8");
        let problem = parseCNF(problemText);
        let optimized = optimizeCNF(problem);
        time = Date.now() - time;
        let optimizedText = stringifyCNF(optimized);
        console.log(
            `Reduced problem: ${getSizeCNF(problem)} -> ${getSizeCNF(optimized)} (${time}ms)`
        );
        let now = new Date();
        let name = path.join(BENCHMARK_OUTPUT_DIR, `${pset}-${pfile.split(".")[0]}.cnf`);
        fs.writeFileSync(name, optimizedText, "utf8");
        console.log("\n");
        console.log(`file://${name}`);
    }
    if (input !== "3") {
        //benchmaks ran, write results to file
        let outputDest = writeBenchmarkResults();
        console.log(`Benchmark results written!`);
        console.log(`file://${outputDest}`);
    }
}
main();
