package main

import "fmt"

func Run() int {
    return Add(1, 2)
}

func Add(a, b int) int {
    return a + b
}

type Calc struct{}

func (c Calc) Total(n int) int { return n }

