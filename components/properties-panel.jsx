'use client'
import { useState } from "react"
import { Trash2, Plus } from "lucide-react"

const PropertiesPanel = ({
  selectedItem,
  onUpdateField,
  onUpdateFieldset,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onDeleteField,
}) => {
  const [localChanges, setLocalChanges] = useState({})

  if (!selectedItem) {
    return (
      <div className="w-1/4 p-4 panel overflow-y-auto">
        <h2 className="mb-4 text-base font-medium">Field Properties</h2>
        <p className="text-gray-500">Select a field to edit its properties</p>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setLocalChanges({ ...localChanges, [name]: value })
  }

  const handleOptionChange = (optionId, value) => {
    setLocalChanges({
      ...localChanges,
      options: (localChanges.options || selectedItem.options).map((option) => {
        if (option.id === optionId) {
          return { ...option, value }
        }
        return option
      }),
    })
  }

  const handleApply = () => {
    if (selectedItem.type === "fieldset") {
      onUpdateFieldset(selectedItem.id, localChanges)
    } else {
      onUpdateField(selectedItem.fieldsetId, selectedItem.id, localChanges)
    }
    setLocalChanges({})
  }

  const handleDelete = () => {
    if (selectedItem.type === "fieldset") {
      // Handle fieldset deletion
    } else {
      onDeleteField(selectedItem.fieldsetId, selectedItem.id)
    }
  }

  const renderFieldProperties = () => {
    if (selectedItem.type === "fieldset") {
      return (
        <div className="bg-white p-4 rounded-md">
          <h3 className="mb-2 text-sm font-medium">Field-set</h3>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Enter field-set name"
              className="w-full p-2 border rounded-md text-sm"
              value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )
    }

    switch (selectedItem.type) {
      case "select":
      case "number-select":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Combo Box / Dropdown</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter field name"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 mb-4">
              {(localChanges.options || selectedItem.options).map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="text"
                    placeholder={`Option ${option.id}`}
                    className="flex-1 p-2 border rounded-md text-sm"
                    value={option.value}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  />
                  <button
                    className="p-1 ml-2 text-gray-400 hover:text-red-500"
                    onClick={() => onDeleteOption(selectedItem.fieldsetId, selectedItem.id, option.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {/* <div className="mb-4">
              <div className="flex items-center justify-between bg-gray-100 rounded-md">
                <span className="p-2 text-sm">Add new option</span>
                <button
                  className="p-2 bg-blue-500 rounded-r-md hover:bg-blue-600"
                  onClick={() => onAddOption(selectedItem.fieldsetId, selectedItem.id)}
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div> */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add new option"
                disabled
                className="flex-1 p-2 border border-gray-200 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={() => onAddOption(selectedItem.fieldsetId, selectedItem.id)}
                className="ml-2 bg-blue-100 text-blue-500 p-1 rounded-md hover:bg-blue-200"
              >
                <Plus size={26} />
              </button>
            </div>
          </div>
        )
      case "radio":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Radio Button</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter field name"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 mb-4">
              {(localChanges.options || selectedItem.options).map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="text"
                    placeholder={`Option ${option.id}`}
                    className="flex-1 p-2 border rounded-md text-sm"
                    value={option.value}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  />
                  <button
                    className="p-1 ml-2 text-gray-400 hover:text-red-500"
                    onClick={() => onDeleteOption(selectedItem.fieldsetId, selectedItem.id, option.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {/* <div className="mb-4">
              <div className="flex items-center justify-between bg-gray-100 rounded-md">
                <span className="p-2 text-sm">Add new option</span>
                <button
                  className="p-2 bg-blue-500 rounded-r-md hover:bg-blue-600"
                  onClick={() => onAddOption(selectedItem.fieldsetId, selectedItem.id)}
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div> */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add new option"
                disabled
                className="flex-1 p-2 border border-gray-200 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={() => onAddOption(selectedItem.fieldsetId, selectedItem.id)}
                className="ml-2 bg-blue-100 text-blue-500 p-1 rounded-md hover:bg-blue-200"
              >
                <Plus size={26} />
              </button>
            </div>
          </div>
        )
      case "checkbox":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Checkbox</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter field name"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 mb-4">
              {(localChanges.options || selectedItem.options).map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="text"
                    placeholder={`Option ${option.id}`}
                    className="flex-1 p-2 border rounded-md text-sm"
                    value={option.value}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  />
                  <button
                    className="p-1 ml-2 text-gray-400 hover:text-red-500"
                    onClick={() => onDeleteOption(selectedItem.fieldsetId, selectedItem.id, option.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {/* <div className="mb-4">
              <div className="flex items-center justify-between bg-gray-100 rounded-md">
                <span className="p-2 text-sm">Add new option</span>
                <button
                  className="p-2 bg-blue-500 rounded-r-md hover:bg-blue-600"
                  onClick={() => onAddOption(selectedItem.fieldsetId, selectedItem.id)}
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div> */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add new option"
                disabled
                className="flex-1 p-2 border border-gray-200 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={() => onAddOption(selectedItem.fieldsetId, selectedItem.id)}
                className="ml-2 bg-blue-100 text-blue-500 p-1 rounded-md hover:bg-blue-200"
              >
                <Plus size={26} />
              </button>
            </div>
          </div>
        )
      case "text":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Text Field</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter field name"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="placeholder"
                placeholder="Placeholder text"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.placeholder !== undefined ? localChanges.placeholder : selectedItem.placeholder}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )
      case "number":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Number Input</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter field name"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="placeholder"
                placeholder="Placeholder text"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.placeholder !== undefined ? localChanges.placeholder : selectedItem.placeholder}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )
      case "date":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Datepicker</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter field name"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )
      case "label":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Label</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter label text"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )
      case "textarea":
        return (
          <div className="bg-white p-4 rounded-md">
            <h3 className="mb-2 text-sm font-medium">Text Area</h3>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Enter field name"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.name !== undefined ? localChanges.name : selectedItem.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="placeholder"
                placeholder="Placeholder text"
                className="w-full p-2 border rounded-md text-sm"
                value={localChanges.placeholder !== undefined ? localChanges.placeholder : selectedItem.placeholder}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-1/4 p-4 panel overflow-y-auto">
      <h2 className="mb-4 text-base font-medium">Field Properties</h2>
      {renderFieldProperties()}
      <div className="flex mt-4">
        <button
          className="cursor-pointer flex-1 p-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button className="cursor-pointer flex-1 p-2 text-white bg-red-500 rounded-md hover:bg-red-600 text-sm" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  )
}

export default PropertiesPanel
