"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type * as React from "react";

import { useDelegatedComponentEventHandler } from "@/lib/report-parent-window";

import { cn } from "@/lib/utils";

function Tabs({
	className,
	id,
	defaultValue,
	value,
	onValueChange,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
	id?: string;
}) {
	const handleValueChange = useDelegatedComponentEventHandler(
		onValueChange,
		() => ({
			componentType: "tabs",
			eventType: "value-change",
			componentInfo: {
				id,
			},
		}),
	);
	return (
		<TabsPrimitive.Root
			id={id}
			data-slot="tabs"
			className={cn("flex flex-col gap-2", className)}
			defaultValue={defaultValue}
			value={value}
			onValueChange={handleValueChange}
			{...props}
		/>
	);
}

function TabsList({
	className,
	id,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
	id?: string;
}) {
	return (
		<TabsPrimitive.List
			id={id}
			data-slot="tabs-list"
			className={cn(
				"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
				className,
			)}
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	id,
	value,
	onClick,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "tabs-trigger",
		eventType: "click",
		componentInfo: {
			id,
			value,
		},
	}));
	return (
		<TabsPrimitive.Trigger
			id={id}
			value={value}
			data-slot="tabs-trigger"
			className={cn(
				"data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			onClick={handleClick}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	id,
	value,
	onFocus,
	onBlur,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	const handleFocus = useDelegatedComponentEventHandler(onFocus, () => ({
		componentType: "tabs-content",
		eventType: "focus",
		componentInfo: {
			id,
			value,
		},
	}));

	const handleBlur = useDelegatedComponentEventHandler(onBlur, () => ({
		componentType: "tabs-content",
		eventType: "blur",
		componentInfo: {
			id,
			value,
		},
	}));
	return (
		<TabsPrimitive.Content
			id={id}
			value={value}
			data-slot="tabs-content"
			className={cn("flex-1 outline-none", className)}
			onFocus={handleFocus}
			onBlur={handleBlur}
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
