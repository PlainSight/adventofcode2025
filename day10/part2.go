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

func generateRowReducedMatrix(problemId int) ([][]frac.Fraction, []int) {
	var rowReduced [][]frac.Fraction
	var remaining [][]frac.Fraction

	for i, ml := range problems[problemId].relatedButtons {
		fractionalised := make([]frac.Fraction, len(problems[problemId].wirings))
		for i := range fractionalised {
			fractionalised[i], _ = frac.New(0, 1)
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

	for pos := 0; pos < variableCount; pos++ {
		topIndex := slices.IndexFunc(remaining, func(fr []frac.Fraction) bool {
			return fr[pos].Numerator() != 0
		})
		if topIndex == -1 {
			independentVariables = append(independentVariables, pos)
			continue
		}
		topRow := remaining[topIndex]

		remaining = slices.Delete(remaining, topIndex, topIndex+1)

		if topRow[pos].Numerator() != 1 {
			mul, _ := frac.New(topRow[pos].Denominator(), topRow[pos].Numerator())
			for n := 0; n < len(topRow); n++ {
				topRow[n] = topRow[n].Multiply(mul)
			}
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
			mappedRowReduced = append(mappedRowReduced, rowReduced[rrIndex])
			rrIndex++
		} else {
			mappedRowReduced = append(mappedRowReduced, nil)
		}
	}

	if len(independentVariables) > 0 {
		fmt.Printf("%d\n%v\n%v\n\n", problemId, mappedRowReduced, independentVariables)
	}

	return mappedRowReduced, independentVariables
}

func maxValuesForIndependentVariables(problemId int, variables []int, index int) int {
	max := 1000
	for i, rb := range problems[problemId].relatedButtons {
		if slices.Index(rb, index) != -1 {
			// left side of equation
			left := 0
			for rbci, rbc := range rb {
				if variables[rbci] > 0 {
					left += rbc * variables[rbci]
				}
			}
			// right side of equation
			right := problems[problemId].joltages[i]

			value := right - left

			if value < max {
				max = value
			}
		}
	}

	return max
}

func searchIndependentVariables(problemId int, mappedRowReduced [][]frac.Fraction, values []int, freeRemaining []int) int {
	maxValues := maxValuesForIndependentVariables(problemId, values)

}

func solve(i int) int {
	rrm, iv := generateRowReducedMatrix(i)

	values := make([]int, len(problems[i].wirings))
	score := searchIndependentVariables(i, rrm, values, iv)

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
		for j := range joltages {
			var relatedButtonsToJoltage []int
		outer:
			for wi, w := range wirings {
				for _, wo := range w {
					if wo == j {
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

		//fmt.Printf("%d\n%v\n%v\n%v\n\n", i, wirings, joltages, relatedButtons)

		problems = append(problems, p)
	}

	sum := 0

	for i := range problems {
		sum += solve(i)
	}

	fmt.Printf("TOTAL SUM: %d\n", sum)
}
