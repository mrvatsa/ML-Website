// Final 
let testRunning = false; 
document.addEventListener("DOMContentLoaded", () => {
    const systemCondition = document.getElementById("systemCondition");
    const conditionContainer = document.querySelector(".condition-container");

    let flashingBackground = null; // To hold the interval for flashing
    let sequence = 0;

    // Mapping conditions to case study file paths
    const caseStudies = {
        "Abnormal: Generator 1 is ON with zero load.": "/Case/AEMA01.html",
        "Abnormal: Generator 2 is ON with zero load.": "/Case/AEMA02.html",
        "Abnormal: Generator 3 is ON with zero load.": "/Case/AEMA03.html",
        "Abnormal: Load distribution mismatch.": "/Case/AEMA04.html",
        "Abnormal: Current distribution mismatch.": "Cases/AEMA01.html",
        "ESBD abnormal: Tie breaker not closing": "Cases/AEMA02.html",
    };

    function monitorGenerators() {

        if (testRunning) return; // Prevent execution if a test is running

        const totalLoad = parseFloat(document.getElementById("totalLoad").value) || 0;
        const totalCurrent = parseFloat(document.getElementById("totalCurrent").value) || 0;
        const gen1Condition = parseInt(document.getElementById("generator1Condition").value) || 0;
        const gen1KW = parseFloat(document.getElementById("generator1KW").value) || 0;
        const gen1Current = parseFloat(document.getElementById("generator1Current").value) || 0;
        const gen2Condition = parseInt(document.getElementById("generator2Condition").value) || 0;
        const gen2KW = parseFloat(document.getElementById("generator2KW").value) || 0;
        const gen2Current = parseFloat(document.getElementById("generator2Current").value) || 0;
        const gen3Condition = parseInt(document.getElementById("generator3Condition").value) || 0;
        const gen3KW = parseFloat(document.getElementById("generator3KW").value) || 0;
        const gen3Current = parseFloat(document.getElementById("generator3Current").value) || 0;

        let status = "Normal";
        let caseStudyPath = null;

        // Abnormal condition checks
        if (gen1Condition && gen1KW <= 0) {
            status = "Abnormal: Generator 1 is ON with zero load.";
            caseStudyPath = caseStudies[status];
        } else if (gen2Condition && gen2KW <= 0) {
            status = "Abnormal: Generator 2 is ON with zero load.";
            caseStudyPath = caseStudies[status];
        } else if (gen3Condition && gen3KW <= 0) {
            status = "Abnormal: Generator 3 is ON with zero load.";
            caseStudyPath = caseStudies[status];
        } else if (gen1KW + gen2KW + gen3KW !== totalLoad) {
            status = "Abnormal: Load distribution mismatch.";
            caseStudyPath = caseStudies[status];
        } else if (gen1Current + gen2Current + gen3Current !== totalCurrent) {
            status = "Abnormal: Current distribution mismatch.";
            caseStudyPath = caseStudies[status];
        } else if (sequence === 500) {
            status = "Abnormal: ESBD Tie breaker not closing";
            caseStudyPath = caseStudies["ESBD abnormal: Tie breaker not closing"];
        }

        // Update condition display
        systemCondition.textContent = `System Condition: ${status}`;

        // Add or remove case study link
        const existingLink = document.getElementById("caseStudyLink");
        if (existingLink) existingLink.remove();
        if (status !== "Normal" && caseStudyPath) {
            const caseStudyLink = document.createElement("a");
            caseStudyLink.href = caseStudyPath;
            caseStudyLink.id = "caseStudyLink";
            caseStudyLink.textContent = "Click here for related case study";
            caseStudyLink.target = "_blank";
            caseStudyLink.style.display = "block";
            caseStudyLink.style.marginTop = "10px";
            caseStudyLink.style.color = "blue";
            caseStudyLink.style.textDecoration = "underline";
            conditionContainer.appendChild(caseStudyLink);
        }

        // Handle flashing background
        if (status !== "Normal") {
            systemCondition.style.color = "red";
            if (!flashingBackground) {
                let isBlue = false;
                flashingBackground = setInterval(() => {
                    document.body.style.backgroundColor = isBlue ? "red" : "blue";
                    isBlue = !isBlue;
                }, 500);
            }
        } else {
            systemCondition.style.color = "green";
            document.body.style.backgroundColor = "#d4edda"; // Light green for normal condition
            if (flashingBackground) {
                clearInterval(flashingBackground);
                flashingBackground = null;
            }
        }
    }

    function simulateTestCaseSteps(steps, delays, callback) {
        testRunning = true; // Disable monitoring when test starts
        let index = 0;
    
        function executeNextStep() {
            if (index < steps.length) {
                steps[index](); // Execute the current step
                const delay = delays[index] || 2000; // Use specified delay, or default to 2 seconds
                index++;
                setTimeout(executeNextStep, delay); // Schedule the next step with the specified delay
            } else {
                setTimeout(() => {
                    testRunning = false; // Re-enable monitoring when test ends
                    if (callback) callback();
                }, 2000);
            }
        }
    
        executeNextStep();
    }
    
    // Test Case 1: Sequentially update Generator 2 Current
    function testCase1() {
        const steps = [
            () => { document.getElementById("generator2Current").value = 725; },
            () => { document.getElementById("generator2Current").value = 700; },
            () => { document.getElementById("generator2Current").value = 680; },
        ];
        simulateTestCaseSteps(steps, [], () => { 
            testRunning = false; 
            monitorGenerators(); 
        });
    }

    // Test Case 2: Sequence for Tie Breaker and Emergency Generator
    function testCase2() {
        const tieBreakerCondition = document.getElementById("tieBreakerACBCondition");
        const esbdVoltageField = document.getElementById("esbdBusVoltage");
        const emergencyGenCondition = document.getElementById("emergencyGeneratorCondition");
        const emergencyGenACBCondition = document.getElementById("emergencyGeneratorACBCondition");
        const emergencyGenCurrentField = document.getElementById("emergencyGeneratorCurrent");
        const emergencyGenKWField = document.getElementById("emergencyGeneratorKW");
    
        // Define steps to execute
        const steps = [
            () => { tieBreakerCondition.value = 0;
                systemCondition.textContent = "System Condition: ESBD blackout";
                systemCondition.style.color = "red";
             }, // Step 1
            () => { esbdVoltageField.value = 0; }, // Step 2
            () => { 
                emergencyGenCondition.value = 1;
                systemCondition.textContent = "System Condition: Emergency Gen Started";
                systemCondition.style.color = "red";
                
             }, // Step 3
            () => { 
                emergencyGenACBCondition.value = 1; 
                emergencyGenCurrentField.value = 350; 
                emergencyGenKWField.value = 200; 
                esbdVoltageField.value = 440; 
                systemCondition.textContent = "System Condition: Emergency Gen On Load";
                systemCondition.style.color = "Green";
            }, // Step 4
            () => { 
                systemCondition.textContent = "System Condition: Normal";
                systemCondition.style.color = "Green";
             }, // Step 5
            () => { 
                emergencyGenACBCondition.value = 0; 
                esbdVoltageField.value = 0; 
                emergencyGenCurrentField.value = 0; 
                emergencyGenKWField.value = 0;
                systemCondition.textContent = "System Condition: Tie Breaker closing";
                systemCondition.style.color = "Green"; 
                // sequence = 500; 
            }, // Step 6
            () => { 
                emergencyGenACBCondition.value = 1; 
                emergencyGenCurrentField.value = 350; 
                emergencyGenKWField.value = 200; 
                esbdVoltageField.value = 440; 
                systemCondition.textContent = "System Condition: Emergency Gen On Load";
                systemCondition.style.color = "Green";
            }, // Step 7
            () => { 
                emergencyGenACBCondition.value = 0; 
                esbdVoltageField.value = 0; 
                emergencyGenCurrentField.value = 0; 
                emergencyGenKWField.value = 0; 
                systemCondition.textContent = "System Condition: Tie Breaker Closing";
                systemCondition.style.color = "red";
                // sequence = 500; 
            }, // Step 8
            () => {
                sequence = 500;
            }
        ];
    
        // Define corresponding delays for each step (in milliseconds)
        const delays = [1000, 4000, 5000, 5000, 2000, 4000, 6000, 3000];
    
        // Simulate steps with delays and monitor generators at the end
        simulateTestCaseSteps(steps, delays, () => { 
            testRunning = false; 
            monitorGenerators(); 
        });
    }
    
    function testCase3(){
        location.reload();
    }
    
    // Attach event listeners to Test Case buttons
    document.getElementById("testCase1").addEventListener("click", testCase1);
    document.getElementById("testCase2").addEventListener("click", testCase2);
    document.getElementById("testCase3").addEventListener("click", testCase3);

    // Monitor generators every 10 seconds
    setInterval(monitorGenerators, 10000);
});
