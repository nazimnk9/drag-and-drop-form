'use client'

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { v4 as uuidv4 } from "uuid"
import CustomFieldPanel from "./custom-field-panel"
import ModuleArea from "./module-area"
import PropertiesPanel from "./properties-panel"
import Header from "./header"

const FormBuilder = () => {
  // State for fieldsets and their fields
  const [fieldsets, setFieldsets] = useState([])

  // State for the currently selected field or fieldset
  const [selectedItem, setSelectedItem] = useState(null)

  // Generate a unique name based on the type
  const generateUniqueName = (type) => {
    const baseNames = {
      text: "Text Field",
      number: "Number Input",
      select: "Combo Box / Dropdown",
      "number-select": "Number Combo Box",
      radio: "Radio Button",
      checkbox: "Checkbox",
      date: "Datepicker",
      label: "Label",
      textarea: "Text Area",
      fieldset: "Field-set",
    }

    const baseName = baseNames[type] || type
    const existingNames = fieldsets.flatMap((fieldset) => [
      fieldset.name,
      ...fieldset.fields.map((field) => field.name),
    ])

    let newName = baseName
    let counter = 1

    while (existingNames.includes(newName)) {
      newName = `${baseName} ${counter}`
      counter++
    }

    return newName
  }

  // Handle dropping a field into a fieldset
  const handleDropField = (fieldType, fieldsetId, index) => {
    // If no fieldset exists or no fieldset is specified, create a new one
    if (fieldsets.length === 0 || !fieldsetId) {
      const newFieldsetId = uuidv4()
      const newField = {
        id: uuidv4(),
        type: fieldType,
        name: generateUniqueName(fieldType),
        label: generateUniqueName(fieldType),
        placeholder: "",
        required: false,
        options:
          fieldType === "select" || fieldType === "number-select" || fieldType === "radio" || fieldType === "checkbox"
            ? [
                { id: uuidv4(), value: "Option 1" },
                { id: uuidv4(), value: "Option 2" },
                { id: uuidv4(), value: "Option 3" },
              ]
            : [],
      }

      setFieldsets([
        ...fieldsets,
        {
          id: newFieldsetId,
          name: generateUniqueName("fieldset"),
          fields: [newField],
        },
      ])

      setSelectedItem({ ...newField, fieldsetId: newFieldsetId })
      return
    }

    // Add field to existing fieldset
    setFieldsets(
      fieldsets.map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          const newField = {
            id: uuidv4(),
            type: fieldType,
            name: generateUniqueName(fieldType),
            label: generateUniqueName(fieldType),
            placeholder: "",
            required: false,
            options:
              fieldType === "select" ||
              fieldType === "number-select" ||
              fieldType === "radio" ||
              fieldType === "checkbox"
                ? [
                    { id: uuidv4(), value: "Option 1" },
                    { id: uuidv4(), value: "Option 2" },
                    { id: uuidv4(), value: "Option 3" },
                  ]
                : [],
          }

          const newFields = [...fieldset.fields]
          if (index !== undefined) {
            newFields.splice(index, 0, newField)
          } else {
            newFields.push(newField)
          }

          setSelectedItem({ ...newField, fieldsetId: fieldset.id })

          return {
            ...fieldset,
            fields: newFields,
          }
        }
        return fieldset
      }),
    )
  }

  // Handle updating a field's properties
  const handleUpdateField = (fieldsetId, fieldId, updates) => {
    setFieldsets(
      fieldsets.map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          return {
            ...fieldset,
            fields: fieldset.fields.map((field) => {
              if (field.id === fieldId) {
                return { ...field, ...updates }
              }
              return field
            }),
          }
        }
        return fieldset
      }),
    )

    // Update selected item if it's the one being edited
    if (selectedItem && selectedItem.id === fieldId) {
      setSelectedItem({ ...selectedItem, ...updates })
    }
  }

  // Handle updating a fieldset's properties
  const handleUpdateFieldset = (fieldsetId, updates) => {
    setFieldsets(
      fieldsets.map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          return { ...fieldset, ...updates }
        }
        return fieldset
      }),
    )

    // Update selected item if it's the fieldset being edited
    if (selectedItem && selectedItem.id === fieldsetId && selectedItem.type === "fieldset") {
      setSelectedItem({ ...selectedItem, ...updates })
    }
  }

  // Handle deleting a field
  const handleDeleteField = (fieldsetId, fieldId) => {
    setFieldsets(
      fieldsets
        .map((fieldset) => {
          if (fieldset.id === fieldsetId) {
            return {
              ...fieldset,
              fields: fieldset.fields.filter((field) => field.id !== fieldId),
            }
          }
          return fieldset
        })
        .filter((fieldset) => fieldset.fields.length > 0 || fieldset.id !== fieldsetId),
    )

    // Clear selection if the deleted field was selected
    if (selectedItem && selectedItem.id === fieldId) {
      setSelectedItem(null)
    }
  }

  // Handle duplicating a field
  const handleDuplicateField = (fieldsetId, fieldId) => {
    setFieldsets(
      fieldsets.map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          const fieldToDuplicate = fieldset.fields.find((field) => field.id === fieldId)
          if (fieldToDuplicate) {
            const duplicatedField = {
              ...fieldToDuplicate,
              id: uuidv4(),
              name: generateUniqueName(fieldToDuplicate.type),
            }

            const fieldIndex = fieldset.fields.findIndex((field) => field.id === fieldId)
            const newFields = [...fieldset.fields]
            newFields.splice(fieldIndex + 1, 0, duplicatedField)

            return {
              ...fieldset,
              fields: newFields,
            }
          }
        }
        return fieldset
      }),
    )
  }

  // Handle moving a field within or between fieldsets
  const handleMoveField = (sourceFieldsetId, sourceIndex, targetFieldsetId, targetIndex) => {
    const newFieldsets = [...fieldsets]

    // Find source and target fieldsets
    const sourceFieldset = newFieldsets.find((fs) => fs.id === sourceFieldsetId)
    const targetFieldset = newFieldsets.find((fs) => fs.id === targetFieldsetId)

    if (!sourceFieldset || !targetFieldset) return

    // Get the field to move
    const [movedField] = sourceFieldset.fields.splice(sourceIndex, 1)

    // Insert at target position
    targetFieldset.fields.splice(targetIndex, 0, movedField)

    setFieldsets(newFieldsets)
  }

  // Handle selecting a field or fieldset
  const handleSelectItem = (item) => {
    setSelectedItem(item)
  }

  // Handle adding an option to a field
  const handleAddOption = (fieldsetId, fieldId) => {
    setFieldsets(
      fieldsets.map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          return {
            ...fieldset,
            fields: fieldset.fields.map((field) => {
              if (field.id === fieldId) {
                const newOption = { id: uuidv4(), value: `Option ${field.options.length + 1}` }
                return {
                  ...field,
                  options: [...field.options, newOption],
                }
              }
              return field
            }),
          }
        }
        return fieldset
      }),
    )

    // Update selected item if it's the one being edited
    if (selectedItem && selectedItem.id === fieldId) {
      const newOption = { id: uuidv4(), value: `Option ${selectedItem.options.length + 1}` }
      setSelectedItem({
        ...selectedItem,
        options: [...selectedItem.options, newOption],
      })
    }
  }

  // Handle deleting an option
  const handleDeleteOption = (fieldsetId, fieldId, optionId) => {
    setFieldsets(
      fieldsets.map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          return {
            ...fieldset,
            fields: fieldset.fields.map((field) => {
              if (field.id === fieldId) {
                const updatedOptions = field.options.filter((option) => option.id !== optionId)
                return {
                  ...field,
                  options: updatedOptions,
                }
              }
              return field
            }),
          }
        }
        return fieldset
      }),
    )

    // Update selected item if it's the one being edited
    if (selectedItem && selectedItem.id === fieldId) {
      const updatedOptions = selectedItem.options.filter((option) => option.id !== optionId)
      setSelectedItem({
        ...selectedItem,
        options: updatedOptions,
      })
    }
  }

  // Handle updating an option
  const handleUpdateOption = (fieldsetId, fieldId, optionId, value) => {
    setFieldsets(
      fieldsets.map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          return {
            ...fieldset,
            fields: fieldset.fields.map((field) => {
              if (field.id === fieldId) {
                const updatedOptions = field.options.map((option) => {
                  if (option.id === optionId) {
                    return { ...option, value: value }
                  }
                  return option
                })
                return {
                  ...field,
                  options: updatedOptions,
                }
              }
              return field
            }),
          }
        }
        return fieldset
      }),
    )

    if (selectedItem && selectedItem.id === fieldId) {
      const updatedOptions = selectedItem.options.map((option) => {
        if (option.id === optionId) {
          return { ...option, value: value }
        }
        return option
      })
      setSelectedItem({
        ...selectedItem,
        options: updatedOptions,
      })
    }
  }

  // Handle saving the form
  const handleSaveForm = () => {
    console.log("Form saved:", fieldsets)
    alert("Form saved successfully!")
  }

  // Handle draft save
  const handleDraft = () => {
    console.log("Draft saved:", fieldsets)
    alert("Draft saved successfully!")
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <CustomFieldPanel />
          <ModuleArea
            fieldsets={fieldsets}
            onDropField={handleDropField}
            onSelectItem={handleSelectItem}
            selectedItem={selectedItem}
            onMoveField={handleMoveField}
            onDeleteField={handleDeleteField}
            onDuplicateField={handleDuplicateField}
          />
          <PropertiesPanel
            selectedItem={selectedItem}
            onUpdateField={handleUpdateField}
            onUpdateFieldset={handleUpdateFieldset}
            onAddOption={handleAddOption}
            onUpdateOption={handleUpdateOption}
            onDeleteOption={handleDeleteOption}
            onDeleteField={handleDeleteField}
          />
        </div>
        <div className="flex justify-end p-4 bg-gray-100">
          <button className="cursor-pointer px-6 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md text-sm hover:bg-gray-300" onClick={handleDraft}>
            Draft
          </button>
          <button className="cursor-pointer px-6 py-2 text-white bg-red-500 rounded-md text-sm hover:bg-red-600" onClick={handleSaveForm}>
            Save Form
          </button>
        </div>
      </div>
    </DndProvider>
  )
}

export default FormBuilder
