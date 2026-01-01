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

func generateRowReducedMatrix(problemId int) [][]frac.Fraction {
	var rowReduced [][]frac.Fraction
	var remaining [][]frac.Fraction

	fmt.Printf("PROBLEM: %v\n", problems[problemId])

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

	for pos := 0; len(remaining) > 0 && pos < len(remaining[0])-1; pos++ {
		topIndex := slices.IndexFunc(remaining, func(fr []frac.Fraction) bool {
			return fr[pos].Numerator() != 0
		})
		if topIndex == -1 {
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

	fmt.Printf("%d %v\n", problemId, rowReduced)

	//v, _ := frac.New(5, 1)
	return nil
}

func solve(i int) int {
	rrm := generateRowReducedMatrix(i)

	return len(rrm)
}

func main() {
	data, err := os.ReadFile("input.txt") // data is a []byte
	if err != nil {
		return
	}
	// Convert the byte slice to a string for printing or processing as text
	input := string(data)

	lines := strings.Split(input, "\r\n")

	fmt.Println(lines[0])

	for i, l := range lines {
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
		for j, _ := range joltages {
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

		fmt.Printf("%d\n%v\n%v\n%v\n\n", i, wirings, joltages, relatedButtons)

		problems = append(problems, p)
	}

	sum := 0

	for i := range problems {
		sum += solve(i)
	}

	fmt.Printf("TOTAL SUM: %d\n", sum)
}
