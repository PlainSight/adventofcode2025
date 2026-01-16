package main

import (
	"fmt"
	"os"
	"slices"
	"strconv"
	"strings"
)

type Problem struct {
	joltages       []int
	wirings        [][]int
	relatedButtons [][]int
}

var problems []Problem

func eliminate(target []int, reducer []int, position int) []int {
	mult := target[position]

	if mult == 0 {
		return target
	}
	var result []int

	for i, t := range target {
		r := reducer[i]

		temp := t - r*mult

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

func generateRowReducedMatrix(problemId int) ([][]int, []int) {
	var rowReduced [][]int
	var remaining [][]int

	for i, ml := range problems[problemId].relatedButtons {
		augmented := make([]int, len(problems[problemId].wirings))
		for f := range augmented {
			augmented[f] = 0
		}
		for _, mc := range ml {
			augmented[mc] = 1
		}
		augmented = append(augmented, problems[problemId].joltages[i])

		remaining = append(remaining, augmented)
	}

	var independentVariables []int

	variableCount := len(remaining[0]) - 1

	for pos := range variableCount {
		topIndex := slices.IndexFunc(remaining, func(fr []int) bool {
			return fr[pos] != 0
		})
		if topIndex == -1 {
			independentVariables = append(independentVariables, pos)
			continue
		}
		topRow := remaining[topIndex]
		secondIndex := slices.IndexFunc(remaining[topIndex:], func(fr []int) bool {
			return fr[pos] != 0
		})
		if secondIndex == -1 {
			fmt.Printf("OH NO")
		}
		secondRow := remaining[topIndex:][secondIndex]

		remaining = slices.Delete(remaining, topIndex, topIndex+1)

		// ensure that we always have 1 at the start
		// we need to do only multiplication and subtransaction to figure this
		// we should use topRow and SecondRow to reduce topRow[pos] to 1

		numeral := topRow[pos]
		for n := 0; n < len(topRow); n++ {
			topRow[n] = topRow[n].Multiply(mul)
		}

		// eliminate pos from all values in remaining and rowReduced

		var newRowReduced [][]int

		for _, r := range rowReduced {
			newRowReduced = append(newRowReduced, eliminate(r, topRow, pos))
		}

		var newRemaining [][]int

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

	var mappedRowReduced [][]int

	rrIndex := 0
	for n := range variableCount {
		if rrIndex < len(rowReduced) && rowReduced[rrIndex][n].Numerator() != 0 {
			var simplifiedRow []int
			for _, r := range rowReduced[rrIndex] {
				simplified, _ := frac.New(r.Numerator(), r.Denominator())
				simplifiedRow = append(simplifiedRow, simplified)
			}
			mappedRowReduced = append(mappedRowReduced, simplifiedRow)
			rrIndex++
		} else {
			mappedRowReduced = append(mappedRowReduced, make([]int, variableCount+1))
		}
	}

	return mappedRowReduced, independentVariables
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

func searchIndependentVariables(problemId int, mappedRowReduced [][]int, variables []int, freeRemaining []int, freePos int) int {
	if freePos == len(freeRemaining) {
		return evaluate(mappedRowReduced, variables)
	}

	topFreeVariable := freeRemaining[freePos]

	maxValue := maxValueForIndependentVariable(problemId, variables, topFreeVariable)

	bestScore := 1000

	for x := 0; x <= maxValue; x++ {
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

func calculateDependentVariables(mappedRowReduce [][]int, variables []int) ([]int, bool) {
	calculatedVariables := make([]int, len(variables))

	for j := len(variables) - 1; j >= 0; j-- {
		if mappedRowReduce[j][j] != 0 {
			// accumulate values from j+1 to len(variables)
			otherLeft := 0
			for l := j + 1; l < len(variables); l++ {
				currentCooefficient := mappedRowReduce[j][l]
				currentVariable = variables[l]
				otherLeft = otherLeft + (currentCooefficient * currentVariable)
			}
			right := mappedRowReduce[j][len(mappedRowReduce[j])-1]

			value := right - otherLeft

			if value < 0 {
				return nil, false
			}
			calculatedVariables[j] = value
		} else {
			calculatedVariables[j] = variables[j]
		}
	}

	return calculatedVariables, true
}

func evaluate(mappedRowReduce [][]int, variables []int) int {
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
	rrm, iv := generateRowReducedMatrix(i)

	values := make([]int, len(problems[i].wirings))
	score := searchIndependentVariables(i, rrm, values, iv, 0)

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
