
# BE Finance Styles and Theming

This document explains the styling approach, theming system, and visual design patterns used in the BE Finance application.

## Styling Approach

BE Finance uses a combination of Tailwind CSS and component-based styling:

1. **Tailwind CSS**: Utility-first CSS framework for rapid styling
2. **Shadcn UI**: Pre-built components with consistent styling
3. **Custom CSS**: Additional styling for specific needs

## Color System

The application uses a finance-themed color palette:

- **Primary Color (finance-600)**: Used for primary buttons, links, and important UI elements
- **Secondary Colors**:
  - finance-50 through finance-950: Different shades for various UI needs
  - Gray-scale colors for neutral elements

Example of color usage:
```tsx
<button className="bg-finance-600 hover:bg-finance-700 text-white">
  Submit
</button>
```

## Typography

The application uses a consistent typography system:

- **Headings**: Font sizes from text-xl to text-4xl with appropriate font weights
- **Body Text**: Regular text with sizes from text-sm to text-lg
- **Font Weights**: Used strategically to create visual hierarchy

Example of typography usage:
```tsx
<h1 className="text-4xl font-bold text-finance-900">
  Commercial Loan Eligibility
</h1>
<p className="text-lg text-finance-600">
  Check if your business qualifies for our loan products.
</p>
```

## Component Styling

### Card Components

Cards are used throughout the application to group related content:

```tsx
<Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl">
  <CardHeader className="bg-finance-50 border-b">
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
  <CardFooter className="border-t bg-gray-50">
    {/* Footer */}
  </CardFooter>
</Card>
```

### Form Elements

Form elements use consistent styling for inputs, labels, and controls:

```tsx
<div className="space-y-2">
  <Label htmlFor="input" className="text-sm font-medium">
    Label
  </Label>
  <Input 
    id="input" 
    className="border border-gray-300 rounded-md"
  />
</div>
```

## Animation System

Animations are implemented using Framer Motion for smooth transitions:

- **Page Transitions**: Fade and slide effects when navigating between pages
- **Form Transitions**: Staggered animations for form elements
- **Feedback Animations**: Subtle animations for user interactions

Example of animation usage:
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

## Responsive Design

The application is fully responsive, adapting to different screen sizes:

- **Mobile-First Approach**: Base styles are for mobile devices
- **Responsive Breakpoints**: Tailwind's sm, md, lg, xl breakpoints
- **Flexible Layouts**: Grid and flexbox for adaptive layouts

Example of responsive design:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Content that's 1 column on mobile, 2 on tablet+ */}
</div>
```

## UI Components Usage

### Shadcn UI Components

The application leverages Shadcn UI components for consistent UI elements:

- **Buttons**: Different variants for different actions
- **Form Controls**: Inputs, selects, sliders
- **Feedback**: Toast notifications
- **Navigation**: Tabs, breadcrumbs

### Icons

Icons from Lucide React are used throughout the application:

```tsx
<IndianRupeeIcon className="h-5 w-5 text-finance-600" />
```

## Classes and Styling Patterns

Common styling patterns used in the application:

- **Container Classes**: `container mx-auto px-4` for consistent content width
- **Card Patterns**: `shadow-lg rounded-xl border border-gray-200`
- **Form Groups**: `space-y-2` or `space-y-4` for consistent spacing
- **Button Variations**: `bg-finance-600 hover:bg-finance-700 text-white px-4 py-2 rounded`
