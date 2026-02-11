/* eslint-disable */
"use client";
import { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";

// Define the AnimalDatum interface with name, speed, and diet
interface AnimalDatum {
  name: string;
  speed: number;
  diet: "herbivore" | "omnivore" | "carnivore";
}

// Valid diet types
const validDiets = ["herbivore", "omnivore", "carnivore"] as const;

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // Load CSV data
  useEffect(() => {
    csv<{ name: string; speed: string; diet: string }>("/sample_animals.csv")
      .then((data) => {
        // Process and filter the data
        const processed: AnimalDatum[] = data
          .map((row) => {
            const speed = parseFloat(row.speed);
            const name = row.name?.trim();
            const diet = row.diet?.trim().toLowerCase();

            // Filter out invalid data: must have valid name, valid speed, and valid diet
            if (
              !name ||
              name === "nan" ||
              isNaN(speed) ||
              speed <= 0 ||
              !validDiets.includes(diet as typeof validDiets[number])
            ) {
              return null;
            }

            return {
              name,
              speed,
              diet: diet as "herbivore" | "omnivore" | "carnivore",
            };
          })
          .filter((item): item is AnimalDatum => item !== null)
          // Sort by speed descending and take top 40 for readability
          .sort((a, b) => b.speed - a.speed)
          .slice(0, 40);

        setAnimalData(processed);
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
      });
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 150, bottom: 100, left: 100 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = select(graphRef.current!)
      .append<SVGSVGElement>("svg")
      .attr("width", width)
      .attr("height", height);

    // Create a group for the chart area (inside margins)
    const chartGroup = svg
      .append<SVGGElement>("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    // X-axis: band scale for animal names
    const xScale = scaleBand()
      .domain(animalData.map((d) => d.name))
      .range([0, chartWidth])
      .paddingInner(0.2)
      .paddingOuter(0.1);

    // Y-axis: linear scale for speeds
    const maxSpeed = max(animalData, (d) => d.speed) ?? 120;
    const yScale = scaleLinear()
      .domain([0, maxSpeed * 1.1]) // Add 10% padding at top
      .range([chartHeight, 0])
      .nice();

    // Color scale: ordinal scale for diet types
    const colorScale = scaleOrdinal<string>()
      .domain(["herbivore", "omnivore", "carnivore"])
      .range(["#22c55e", "#eab308", "#ef4444"]); // Green, Yellow, Red

    // Draw bars
    chartGroup
      .selectAll<SVGRectElement, AnimalDatum>("rect")
      .data(animalData)
      .enter()
      .append<SVGRectElement>("rect")
      .attr("x", (d) => xScale(d.name) ?? 0)
      .attr("y", (d) => yScale(d.speed))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => chartHeight - yScale(d.speed))
      .attr("fill", (d) => colorScale(d.diet))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("rx", 2); // Rounded corners

    // Add x-axis
    const xAxis = axisBottom(xScale);
    const xAxisGroup = chartGroup
      .append<SVGGElement>("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    // Style x-axis lines and ticks
    xAxisGroup.selectAll("path").style("stroke", "hsl(var(--foreground))").style("opacity", "0.3");
    xAxisGroup.selectAll("line").style("stroke", "hsl(var(--foreground))").style("opacity", "0.3");

    // Rotate x-axis labels to prevent overlap
    xAxisGroup
      .selectAll<SVGTextElement, string>("text")
      .attr("transform", "rotate(-45)")
      .attr("x", -10)
      .attr("y", 10)
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", "hsl(var(--foreground))"); // Use theme foreground color

    // Add y-axis
    const yAxis = axisLeft(yScale).ticks(8);
    const yAxisGroup = chartGroup.append<SVGGElement>("g").call(yAxis);

    // Style y-axis lines and ticks
    yAxisGroup.selectAll("path").style("stroke", "hsl(var(--foreground))").style("opacity", "0.3");
    yAxisGroup.selectAll("line").style("stroke", "hsl(var(--foreground))").style("opacity", "0.3");

    // Style y-axis labels
    yAxisGroup
      .selectAll<SVGTextElement, number>("text")
      .style("font-size", "11px")
      .style("fill", "hsl(var(--foreground))"); // Use theme foreground color

    // Add axis titles
    // X-axis title - positioned at the very bottom to avoid overlap with rotated labels
    svg
      .append<SVGTextElement>("text")
      .attr("x", width / 2)
      .attr("y", height) // Position at the absolute bottom edge
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "hsl(var(--foreground))") // Use theme foreground color
      .style("dominant-baseline", "text-after-edge") // Align text to bottom
      .text("Animal");

    // Y-axis title
    svg
      .append<SVGTextElement>("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left / 2 - 10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "hsl(var(--foreground))") // Use theme foreground color
      .text("Speed (km/h)");

    // Add legend
    const legendGroup = svg
      .append<SVGGElement>("g")
      .attr("transform", `translate(${width - margin.right + 20},${margin.top})`);

    const legendData = [
      { label: "Herbivore", color: colorScale("herbivore") },
      { label: "Omnivore", color: colorScale("omnivore") },
      { label: "Carnivore", color: colorScale("carnivore") },
    ];

    const legendItems = legendGroup
      .selectAll<SVGGElement, { label: string; color: string }>("g")
      .data(legendData)
      .enter()
      .append<SVGGElement>("g")
      .attr("transform", (d, i) => `translate(0,${i * 25})`);

    // Add colored squares
    legendItems
      .append<SVGRectElement>("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("rx", 2);

    // Add labels
    legendItems
      .append<SVGTextElement>("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .style("alignment-baseline", "middle")
      .style("fill", "hsl(var(--foreground))") // Use theme foreground color
      .text((d) => d.label);

    // Add chart title
    svg
      .append<SVGTextElement>("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .style("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "hsl(var(--foreground))") // Use theme foreground color
      .text("Top 40 Fastest Animals by Speed");
  }, [animalData]);

  // Return the graph container
  return (
    <div
      ref={graphRef}
      className="w-full min-h-[500px] border rounded-lg p-4 bg-background"
      style={{ minWidth: "600px" }}
    />
  );
}
