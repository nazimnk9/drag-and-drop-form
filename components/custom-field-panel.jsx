import { useDrag } from "react-dnd"
import { Type, Hash, ListFilter, Circle, CheckSquare, Calendar, AlignLeft, SquareStack } from "lucide-react"

const CustomFieldPanel = () => {
  const fieldTypes = [
    { id: "label", name: "Label", icon: Type },
    { id: "text", name: "Text Field", icon: AlignLeft },
    { id: "number", name: "Number Input", icon: Hash },
    { id: "radio", name: "Radio Button", icon: Circle },
    { id: "number-select", name: "Number Combo Box", icon: SquareStack },
    { id: "select", name: "Combo Box / Dropdown", icon: ListFilter },
    { id: "checkbox", name: "Checkbox", icon: CheckSquare },
    { id: "date", name: "Datepicker", icon: Calendar },
    { id: "textarea", name: "Text Area", icon: AlignLeft },
  ]

  return (
    <div className="w-1/4 p-4 panel overflow-y-auto">
      <h2 className="mb-4 text-base font-medium">Custom Field</h2>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <DraggableFieldItem key={field.id} field={field} />
        ))}
      </div>
    </div>
  )
}

const DraggableFieldItem = ({ field }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "FIELD",
    item: { type: field.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const Icon = field.icon

  return (
    <div
      ref={drag}
      className={`flex items-center justify-between p-2 bg-white  rounded-md cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center">
        <Icon className="w-4 h-4 mr-2 text-gray-500" />
        <span className="text-sm">{field.name}</span>
      </div>
      <div className="flex items-center justify-center w-6 h-6 text-gray-400">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 2.5C6 3.32843 5.32843 4 4.5 4C3.67157 4 3 3.32843 3 2.5C3 1.67157 3.67157 1 4.5 1C5.32843 1 6 1.67157 6 2.5Z"
            fill="currentColor"
          />
          <path
            d="M6 8C6 8.82843 5.32843 9.5 4.5 9.5C3.67157 9.5 3 8.82843 3 8C3 7.17157 3.67157 6.5 4.5 6.5C5.32843 6.5 6 7.17157 6 8Z"
            fill="currentColor"
          />
          <path
            d="M6 13.5C6 14.3284 5.32843 15 4.5 15C3.67157 15 3 14.3284 3 13.5C3 12.6716 3.67157 12 4.5 12C5.32843 12 6 12.6716 6 13.5Z"
            fill="currentColor"
          />
          <path
            d="M13 2.5C13 3.32843 12.3284 4 11.5 4C10.6716 4 10 3.32843 10 2.5C10 1.67157 10.6716 1 11.5 1C12.3284 1 13 1.67157 13 2.5Z"
            fill="currentColor"
          />
          <path
            d="M13 8C13 8.82843 12.3284 9.5 11.5 9.5C10.6716 9.5 10 8.82843 10 8C10 7.17157 10.6716 6.5 11.5 6.5C12.3284 6.5 13 7.17157 13 8Z"
            fill="currentColor"
          />
          <path
            d="M13 13.5C13 14.3284 12.3284 15 11.5 15C10.6716 15 10 14.3284 10 13.5C10 12.6716 10.6716 12 11.5 12C12.3284 12 13 12.6716 13 13.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  )
}

export default CustomFieldPanel
