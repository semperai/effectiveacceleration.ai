.PHONY: effectiveacceleration.pdf all clean

all: effectiveacceleration.pdf

effectiveacceleration.pdf: effectiveacceleration.tex
	latexmk -pdf -pdflatex="pdflatex -interaction=nonstopmode" -use-make effectiveacceleration.tex

clean:
	latexmk -CA
