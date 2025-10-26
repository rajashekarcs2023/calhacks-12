import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { useCallback } from "react";

import { useDelegatedComponentEventHandler } from "@/lib/report-parent-window";

import { cn } from "@/lib/utils";

/**
 * Dialog component - Modal dialog with overlay and portal rendering.
 *
 * ⚠️ IMPORTANT: When using forms inside Dialog:
 * - Forms inside Dialog are rendered in a React Portal (different DOM location)
 * - For form validation, use `await form.trigger()` before checking `form.formState.isValid`
 * - Manual validation example:
 * ```tsx
 * const handleSubmit = async () => {
 *   const isValid = await form.trigger(); // Manually trigger validation
 *   if (isValid) {
 *     // Proceed with submission
 *   }
 * };
 * ```
 */
function Dialog({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
	id,
	onClick,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
	id?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "dialog-trigger",
		eventType: "click",
		componentInfo: {
			id,
		},
	}));

	return (
		<DialogPrimitive.Trigger
			data-slot="dialog-trigger"
			id={id}
			onClick={handleClick}
			{...props}
		/>
	);
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
	id,
	onClick,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
	id?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "dialog-close",
		eventType: "click",
		componentInfo: {
			id,
		},
	}));

	return (
		<DialogPrimitive.Close
			data-slot="dialog-close"
			id={id}
			onClick={handleClick}
			{...props}
		/>
	);
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
				className,
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	id,
	onOpenAutoFocus,
	onCloseAutoFocus,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
	id?: string;
}) {
	const handleOpenAutoFocus = useDelegatedComponentEventHandler(
		onOpenAutoFocus,
		() => ({
			componentType: "dialog-content",
			eventType: "open-focus",
			componentInfo: {
				id,
			},
		}),
	);

	const handleCloseAutoFocus = useDelegatedComponentEventHandler(
		onCloseAutoFocus,
		() => ({
			componentType: "dialog-content",
			eventType: "close-focus",
			componentInfo: {
				id,
			},
		}),
	);
	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				id={id}
				onOpenAutoFocus={handleOpenAutoFocus}
				onCloseAutoFocus={handleCloseAutoFocus}
				className={cn(
					"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogClose
						data-slot="dialog-close"
						id={`${id}-close-button`}
						className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
					>
						<XIcon />
						<span className="sr-only">Close</span>
					</DialogClose>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({
	className,
	id,
	onClick,
	...props
}: React.ComponentProps<"div"> & {
	id?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "dialog-header",
		eventType: "click",
		componentInfo: {
			id,
		},
	}));
	return (
		<div
			data-slot="dialog-header"
			id={id}
			onClick={handleClick}
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	id,
	onClick,
	...props
}: React.ComponentProps<"div"> & {
	id?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "dialog-footer",
		eventType: "click",
		componentInfo: {
			id,
		},
	}));
	return (
		<div
			data-slot="dialog-footer"
			id={id}
			onClick={handleClick}
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	id,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & {
	id?: string;
}) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			id={id}
			className={cn("text-lg leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	id,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description> & {
	id?: string;
}) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			id={id}
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
