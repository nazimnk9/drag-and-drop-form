'use client'
import { useDrop } from "react-dnd"
import {
  Trash2,
  Copy,
  GripVertical,
  Type,
  Hash,
  ListFilter,
  Circle,
  CheckSquare,
  Calendar,
  AlignLeft,
  SquareStack,
} from "lucide-react"

const ModuleArea = ({
  fieldsets,
  onDropField,
  onSelectItem,
  selectedItem,
  onMoveField,
  onDeleteField,
  onDuplicateField,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: "FIELD",
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop()
      if (didDrop) {
        return
      }
      onDropField(item.type)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  })

  return (
    <div className="flex-1 p-4 panel overflow-y-auto" ref={drop}>
      <h2 className="mb-4 text-base font-medium">Your Module</h2>

      {fieldsets.length === 0 ? (
        <div className="flex items-center justify-center bg-white h-90 text-gray-400  rounded-md">
          <p>Welcome to the Form Builder! Start by adding your first module to create amazing forms.</p>
        </div>
      ) : (
        <div className="bg-white space-y-4">
          {fieldsets.map((fieldset) => (
            <Fieldset
              key={fieldset.id}
              fieldset={fieldset}
              onDropField={onDropField}
              onSelectItem={onSelectItem}
              selectedItem={selectedItem}
              onMoveField={onMoveField}
              onDeleteField={onDeleteField}
              onDuplicateField={onDuplicateField}
            />
          ))}
        </div>
      )}

      <div
        className={`mt-4 h-16 border border-dashed rounded-md ${
          isOver ? "border-blue-500 bg-blue-50" : "border-red-300 bg-red-50"
        }`}
      />
    </div>
  )
}

const Fieldset = ({
  fieldset,
  onDropField,
  onSelectItem,
  selectedItem,
  onMoveField,
  onDeleteField,
  onDuplicateField,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: "FIELD",
    drop: (item) => {
      onDropField(item.type, fieldset.id)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  const handleFieldsetClick = () => {
    onSelectItem({ ...fieldset, type: "fieldset" })
  }

  return (
    <div
      className={`p-3 border rounded-md ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-200"} ${
        selectedItem && selectedItem.type === "fieldset" && selectedItem.id === fieldset.id
          ? "ring-2 ring-blue-500"
          : ""
      }`}
      ref={drop}
      onClick={handleFieldsetClick}
    >
      <h3 className="mb-2 text-sm font-medium">{fieldset.name}</h3>
      <div className="space-y-2">
        {fieldset.fields.map((field, index) => (
          <Field
            key={field.id}
            field={field}
            fieldsetId={fieldset.id}
            index={index}
            onSelectItem={onSelectItem}
            selectedItem={selectedItem}
            onMoveField={onMoveField}
            onDeleteField={onDeleteField}
            onDuplicateField={onDuplicateField}
          />
        ))}
      </div>
    </div>
  )
}

const Field = ({
  field,
  fieldsetId,
  index,
  onSelectItem,
  selectedItem,
  onMoveField,
  onDeleteField,
  onDuplicateField,
}) => {
  const handleClick = (e) => {
    e.stopPropagation()
    onSelectItem({ ...field, fieldsetId })
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDeleteField(fieldsetId, field.id)
  }

  const handleDuplicate = (e) => {
    e.stopPropagation()
    onDuplicateField(fieldsetId, field.id)
  }

  const renderFieldContent = () => {
    switch (field.type) {
      case "text":
        return (
          <div className="mt-2">
            <input
              type="text"
              className="w-full p-1 border rounded-md text-sm"
              placeholder={field.placeholder || "Enter text"}
            />
          </div>
        )
      case "number":
        return (
          <div className="mt-2">
            <input
              type="number"
              className="w-full p-1 border rounded-md text-sm"
              placeholder={field.placeholder || "Enter number"}
            />
          </div>
        )
      case "textarea":
        return (
          <div className="mt-2">
            <textarea
              className="w-full p-1 border rounded-md text-sm"
              placeholder={field.placeholder || "Enter text"}
              rows={2}
            ></textarea>
          </div>
        )
      case "select":
        return (
          <div className="mt-2">
            <select className="w-full p-1 border rounded-md text-sm">
              <option value="" disabled>
                Select an option
              </option>
              {field.options.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>
        )
      case "number-select":
        return (
          <div className="mt-2">
            <select className="w-full p-1 border rounded-md text-sm">
              <option value="" disabled>
                Select a number
              </option>
              {field.options.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>
        )
      case "checkbox":
        return (
          <div className="mt-2 space-y-1">
            {field.options.map((option, idx) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  defaultChecked={idx === 0}
                />
                <span className="text-sm">{option.value}</span>
              </div>
            ))}
          </div>
        )
      case "radio":
        return (
          <div className="mt-2 space-y-1">
            {field.options.map((option, idx) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name={`radio-${field.id}`}
                  className="mr-2 h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-500"
                  defaultChecked={idx === 0}
                />
                <span className="text-sm">{option.value}</span>
              </div>
            ))}
          </div>
        )
      case "date":
        return (
          <div className="mt-2">
            <input
              type="date"
              className="w-full p-1 border rounded-md text-sm"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
        )
      case "label":
        return (
          <div className="mt-2">
            <span className="text-sm font-medium">{field.label || field.name}</span>
          </div>
        )
      default:
        return null
    }
  }

  const getFieldIcon = () => {
    switch (field.type) {
      case "text":
        return <AlignLeft className="w-4 h-4 text-gray-500" />
      case "number":
        return <Hash className="w-4 h-4 text-gray-500" />
      case "select":
        return <ListFilter className="w-4 h-4 text-gray-500" />
      case "number-select":
        return <SquareStack className="w-4 h-4 text-gray-500" />
      case "radio":
        return <Circle className="w-4 h-4 text-gray-500" />
      case "checkbox":
        return <CheckSquare className="w-4 h-4 text-gray-500" />
      case "date":
        return <Calendar className="w-4 h-4 text-gray-500" />
      case "label":
        return <Type className="w-4 h-4 text-gray-500" />
      case "textarea":
        return <AlignLeft className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <div
      className={`p-2 border rounded-md ${
        selectedItem && selectedItem.id === field.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="flex items-center justify-center w-6 h-6 mr-2 text-gray-400 cursor-move">
          <GripVertical className="w-4 h-4" />
        </div>

        {getFieldIcon()}

        <span className="ml-2 text-sm">{field.name}</span>

        <div className="flex ml-auto">
          <button className="p-1 text-gray-400 hover:text-gray-600" onClick={handleDuplicate} title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-500" onClick={handleDelete} title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {renderFieldContent()}
    </div>
  )
}

export default ModuleArea
