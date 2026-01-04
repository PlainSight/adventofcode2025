package main

import (
	"fmt"
	"os"
	"slices"
	"strconv"
	"strings"

	frac "github.com/nethruster/go-fraction"
)

type Problem struct {
	joltages       []int
	wirings        [][]int
	relatedButtons [][]int
}

var problems []Problem

func eliminate(target []frac.Fraction, reducer []frac.Fraction, position int) []frac.Fraction {
	mult := target[position]

	if mult.Numerator() == 0 {
		return target
	}
	var result []frac.Fraction

	for i, t := range target {
		r := reducer[i]

		temp := t.Subtract(r.Multiply(mult))

		result = append(result, temp)
	}
	return result
}

type iterConstraint struct {
	step         int
	offset       int
	modulo       int
	contributors []int
	contribution []int
	// add contributors counters, mod by modulo, then must equal offset
}

func generateRowReducedMatrix(problemId int) ([][]frac.Fraction, []int, map[int]iterConstraint) {
	var rowReduced [][]frac.Fraction
	var remaining [][]frac.Fraction

	for i, ml := range problems[problemId].relatedButtons {
		fractionalised := make([]frac.Fraction, len(problems[problemId].wirings))
		for f := range fractionalised {
			fractionalised[f], _ = frac.New(0, 1)
		}
		for _, mc := range ml {
			fractionalised[mc], _ = frac.New(1, 1)
		}
		f, _ := frac.New(problems[problemId].joltages[i], 1)
		fractionalised = append(fractionalised, f)

		remaining = append(remaining, fractionalised)
	}

	var independentVariables []int

	variableCount := len(remaining[0]) - 1

	for pos := range variableCount {
		topIndex := slices.IndexFunc(remaining, func(fr []frac.Fraction) bool {
			return fr[pos].Numerator() != 0
		})
		if topIndex == -1 {
			independentVariables = append(independentVariables, pos)
			continue
		}
		topRow := remaining[topIndex]

		remaining = slices.Delete(remaining, topIndex, topIndex+1)

		// ensure that we always have 1 at the start
		mul, _ := frac.New(topRow[pos].Denominator(), topRow[pos].Numerator())
		for n := 0; n < len(topRow); n++ {
			topRow[n] = topRow[n].Multiply(mul)
		}

		// eliminate pos from all values in remaining and rowReduced

		var newRowReduced [][]frac.Fraction

		for _, r := range rowReduced {
			newRowReduced = append(newRowReduced, eliminate(r, topRow, pos))
		}

		var newRemaining [][]frac.Fraction

		for _, r := range remaining {
			newRemaining = append(newRemaining, eliminate(r, topRow, pos))
		}

		remaining = newRemaining
		rowReduced = newRowReduced

		rowReduced = append(rowReduced, topRow)
	}

	for _, r := range remaining {
		rowReduced = append(rowReduced, r)
	}

	var mappedRowReduced [][]frac.Fraction

	rrIndex := 0
	for n := range variableCount {
		if rrIndex < len(rowReduced) && rowReduced[rrIndex][n].Numerator() != 0 {
			var simplifiedRow []frac.Fraction
			for _, r := range rowReduced[rrIndex] {
				simplified, _ := frac.New(r.Numerator(), r.Denominator())
				simplifiedRow = append(simplifiedRow, simplified)
			}
			mappedRowReduced = append(mappedRowReduced, simplifiedRow)
			rrIndex++
		} else {
			mappedRowReduced = append(mappedRowReduced, make([]frac.Fraction, variableCount+1))
		}
	}

	independentVariableSteps := make(map[int]iterConstraint)

	for _, row := range mappedRowReduced {
		fractionalValueCoefficient := row[len(row)-1]
		var variableFractionalCoefficients []frac.Fraction
		var variableFractionalIndexes []int

		for i, col := range row {
			if i != len(row)-1 {
				if col.Denominator() != 1 && col.Denominator() != 0 {
					if slices.Index(independentVariables, i) != -1 {
						variableFractionalIndexes = append(variableFractionalIndexes, i)
						variableFractionalCoefficients = append(variableFractionalCoefficients, col)
					}
				}
			}
		}

		if len(variableFractionalIndexes) > 0 {

			lcmOfAll := int(fractionalValueCoefficient.Denominator())
			for _, v := range variableFractionalCoefficients {
				lcmOfAll = lcm(lcmOfAll, int(v.Denominator()))
			}

			scaleToLCM := func(a frac.Fraction) int {
				topScaler := lcmOfAll / int(a.Denominator())
				return topScaler * int(a.Numerator())
			}

			topScaler := lcmOfAll / int(fractionalValueCoefficient.Denominator())
			target := topScaler * int(fractionalValueCoefficient.Numerator()%fractionalValueCoefficient.Denominator())

			var contributions []int

			for i, _ := range variableFractionalIndexes {
				variable := scaleToLCM(variableFractionalCoefficients[i])
				contributions = append(contributions, variable)
			}

			for i, vfi := range variableFractionalIndexes {
				variable := scaleToLCM(variableFractionalCoefficients[i])
				if variable < 0 {
					variable = -variable
				}

				ic := iterConstraint{
					step:         lcmOfAll,
					modulo:       lcmOfAll,
					offset:       target,
					contributors: variableFractionalIndexes,
					contribution: contributions,
				}

				independentVariableSteps[vfi] = ic
			}
		}
	}

	return mappedRowReduced, independentVariables, independentVariableSteps
}

func lcm(n1, n2 int) int {
	// Put the largest number in n2 because it's divided first, avoiding overflows in some cases
	if n1 > n2 {
		n1, n2 = n2, n1
	}
	return n1 * (n2 / gcd(n1, n2))
}

func gcd(n1, n2 int) int {
	for n2 != 0 {
		n1, n2 = n2, n1%n2
	}
	return n1
}

func maxValueForIndependentVariable(problemId int, variables []int, index int) int {
	max := 1000
	for i, rb := range problems[problemId].relatedButtons {
		if slices.Index(rb, index) != -1 {
			// left side of equation
			left := 0
			for _, rbc := range rb {
				if variables[rbc] > 0 {
					left += variables[rbc]
				}
			}
			// right side of equation
			right := problems[problemId].joltages[i]

			value := right - left

			if value >= 0 && value < max {
				max = value
			}
		}
	}

	return max
}

func searchIndependentVariables(problemId int, mappedRowReduced [][]frac.Fraction, variables []int, freeRemaining []int, freePos int, iterConstraint map[int]iterConstraint) int {
	if freePos == len(freeRemaining) {
		return evaluate(mappedRowReduced, variables)
	}

	topFreeVariable := freeRemaining[freePos]

	maxValue := maxValueForIndependentVariable(problemId, variables, topFreeVariable)

	bestScore := 1000

	offset := 0
	increment := 1

	constraint, ok := iterConstraint[topFreeVariable]

	if ok && freePos == (len(freeRemaining)-1) {
		increment = constraint.step

		existingContribution := 0

		topNumerator := 1

		for i, c := range constraint.contributors {
			if c == topFreeVariable {
				topNumerator = constraint.contribution[i]
			}
			existingContribution += (variables[c] * constraint.contribution[i])
		}

		makePos := func(a int, b int) int {
			return (a%b + b) % b
		}

		existingContribution = makePos(existingContribution, constraint.modulo)

		for i := 0; i < increment; i++ {
			if makePos(((topNumerator*i)+existingContribution), constraint.modulo) == makePos(constraint.offset, constraint.modulo) {
				offset = i
			}
		}
	}

	for x := offset; x <= maxValue; x += increment {
		newVariables := make([]int, len(variables))
		copy(newVariables, variables)
		newVariables[topFreeVariable] = x

		score := searchIndependentVariables(problemId, mappedRowReduced, newVariables, freeRemaining, freePos+1, iterConstraint)

		if score < bestScore {
			bestScore = score
		}
	}

	return bestScore
}

func calculateDependentVariables(mappedRowReduce [][]frac.Fraction, variables []int) ([]int, bool) {
	calculatedVariables := make([]int, len(variables))

	for j := len(variables) - 1; j >= 0; j-- {
		if mappedRowReduce[j][j].Numerator() != 0 {
			// accumulate values from j+1 to len(variables)
			otherLeft, _ := frac.New(0, 1)
			for l := j + 1; l < len(variables); l++ {
				currentCooefficient := mappedRowReduce[j][l]
				currentVariableAsFraction, _ := frac.New(variables[l], 1)
				otherLeft = otherLeft.Add(currentCooefficient.Multiply(currentVariableAsFraction))
			}
			right := mappedRowReduce[j][len(mappedRowReduce[j])-1]

			value := right.Subtract(otherLeft)

			numerator := value.Numerator()
			denominator := value.Denominator()
			if numerator < 0 {
				return nil, false
			}
			if numerator%denominator != 0 {
				return nil, false
			}
			calculatedVariables[j] = int(numerator / denominator)
		} else {
			calculatedVariables[j] = variables[j]
		}
	}

	return calculatedVariables, true
}

func evaluate(mappedRowReduce [][]frac.Fraction, variables []int) int {
	resolvedVariables, valid := calculateDependentVariables(mappedRowReduce, variables)

	if !valid {
		return 1000
	}

	sum := 0
	for _, v := range resolvedVariables {
		sum += v
	}

	return sum
}

func solve(i int) int {
	rrm, iv, ic := generateRowReducedMatrix(i)

	values := make([]int, len(problems[i].wirings))
	score := searchIndependentVariables(i, rrm, values, iv, 0, ic)

	return score
}

func main() {
	data, err := os.ReadFile("input.txt") // data is a []byte
	if err != nil {
		return
	}
	// Convert the byte slice to a string for printing or processing as text
	input := string(data)

	lines := strings.Split(input, "\r\n")

	for _, l := range lines {
		lineParts := strings.Split(l, " ")
		wiringStrings := lineParts[1 : len(lineParts)-1]
		var wirings [][]int
		for _, j := range wiringStrings {
			var outputs []int
			wiring := strings.Split(strings.Trim(j, "()"), ",")
			for _, w := range wiring {
				val, _ := strconv.Atoi(w)
				outputs = append(outputs, val)
			}

			wirings = append(wirings, outputs)
		}

		joltageStrings := strings.Split(strings.Trim(lineParts[len(lineParts)-1], "{}"), ",")
		var joltages []int
		for _, j := range joltageStrings {
			num, _ := strconv.Atoi(j)
			joltages = append(joltages, num)
		}

		var relatedButtons [][]int
		for ji := range joltages {
			var relatedButtonsToJoltage []int
		outer:
			for wi, w := range wirings {
				for _, wo := range w {
					if wo == ji {
						relatedButtonsToJoltage = append(relatedButtonsToJoltage, wi)
						continue outer
					}
				}
			}
			relatedButtons = append(relatedButtons, relatedButtonsToJoltage)
		}

		p := Problem{
			joltages:       joltages,
			wirings:        wirings,
			relatedButtons: relatedButtons,
		}

		problems = append(problems, p)
	}

	sum := 0

	for i := range problems {
		s := solve(i)
		fmt.Printf("ANSWER %d %d\n", i, s)
		sum += s
	}

	fmt.Printf("TOTAL SUM: %d\n", sum)
}
