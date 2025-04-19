"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { v4 as uuidv4 } from "uuid"
import CustomFieldPanel from "./custom-field-panel"
import ModuleArea from "./module-area"
import PropertiesPanel from "./properties-panel"
import Header from "./header"
import { getFormData, updateFormData, convertToApiFormat, convertToInternalFormat } from "@/lib/api"

const FormBuilder = () => {
  // State for fieldsets and their fields
  const [fieldsets, setFieldsets] = useState([])

  // State for loading and error handling
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // State for the currently selected field or fieldset
  const [selectedItem, setSelectedItem] = useState(null)

  // Fetch initial form data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getFormData()

        // If we get data back, convert it to our internal format
        if (data && Array.isArray(data)) {
          const internalFormat = convertToInternalFormat(data)
          setFieldsets(internalFormat)
        } else {
          // If no data or empty array, start with empty fieldsets
          setFieldsets([])
        }

        setError(null)
      } catch (err) {
        console.error("Failed to fetch form data:", err)
        setError("Failed to load form data. Please try again later.")
        // Start with empty fieldsets if there's an error
        setFieldsets([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to save form data to API
  const saveFormToApi = async (updatedFieldsets) => {
    try {
      setSaving(true)
      const apiFormat = convertToApiFormat(updatedFieldsets)
      await updateFormData(apiFormat)
      setSaving(false)
      return true
    } catch (err) {
      console.error("Failed to save form data:", err)
      setError("Failed to save form data. Please try again later.")
      setSaving(false)
      return false
    }
  }

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
  const handleDropField = async (fieldType, fieldsetId, index) => {
    let updatedFieldsets = [...fieldsets]

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

      updatedFieldsets = [
        ...fieldsets,
        {
          id: newFieldsetId,
          name: generateUniqueName("fieldset"),
          fields: [newField],
        },
      ]

      setFieldsets(updatedFieldsets)
      setSelectedItem({ ...newField, fieldsetId: newFieldsetId })
    } else {
      // Add field to existing fieldset
      updatedFieldsets = fieldsets.map((fieldset) => {
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
      })

      setFieldsets(updatedFieldsets)
    }

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle updating a field's properties
  const handleUpdateField = async (fieldsetId, fieldId, updates) => {
    const updatedFieldsets = fieldsets.map((fieldset) => {
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
    })

    setFieldsets(updatedFieldsets)

    // Update selected item if it's the one being edited
    if (selectedItem && selectedItem.id === fieldId) {
      setSelectedItem({ ...selectedItem, ...updates })
    }

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle updating a fieldset's properties
  const handleUpdateFieldset = async (fieldsetId, updates) => {
    const updatedFieldsets = fieldsets.map((fieldset) => {
      if (fieldset.id === fieldsetId) {
        return { ...fieldset, ...updates }
      }
      return fieldset
    })

    setFieldsets(updatedFieldsets)

    // Update selected item if it's the fieldset being edited
    if (selectedItem && selectedItem.id === fieldsetId && selectedItem.type === "fieldset") {
      setSelectedItem({ ...selectedItem, ...updates })
    }

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle deleting a field
  const handleDeleteField = async (fieldsetId, fieldId) => {
    const updatedFieldsets = fieldsets
      .map((fieldset) => {
        if (fieldset.id === fieldsetId) {
          return {
            ...fieldset,
            fields: fieldset.fields.filter((field) => field.id !== fieldId),
          }
        }
        return fieldset
      })
      .filter((fieldset) => fieldset.fields.length > 0 || fieldset.id !== fieldsetId)

    setFieldsets(updatedFieldsets)

    // Clear selection if the deleted field was selected
    if (selectedItem && selectedItem.id === fieldId) {
      setSelectedItem(null)
    }

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle duplicating a field
  const handleDuplicateField = async (fieldsetId, fieldId) => {
    const updatedFieldsets = fieldsets.map((fieldset) => {
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
    })

    setFieldsets(updatedFieldsets)

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle moving a field within or between fieldsets
  const handleMoveField = async (sourceFieldsetId, sourceIndex, targetFieldsetId, targetIndex) => {
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

    // Save to API
    await saveFormToApi(newFieldsets)
  }

  // Handle selecting a field or fieldset
  const handleSelectItem = (item) => {
    setSelectedItem(item)
  }

  // Handle adding an option to a field
  const handleAddOption = async (fieldsetId, fieldId) => {
    const updatedFieldsets = fieldsets.map((fieldset) => {
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
    })

    setFieldsets(updatedFieldsets)

    // Update selected item if it's the one being edited
    if (selectedItem && selectedItem.id === fieldId) {
      const newOption = { id: uuidv4(), value: `Option ${selectedItem.options.length + 1}` }
      setSelectedItem({
        ...selectedItem,
        options: [...selectedItem.options, newOption],
      })
    }

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle deleting an option
  const handleDeleteOption = async (fieldsetId, fieldId, optionId) => {
    const updatedFieldsets = fieldsets.map((fieldset) => {
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
    })

    setFieldsets(updatedFieldsets)

    // Update selected item if it's the one being edited
    if (selectedItem && selectedItem.id === fieldId) {
      const updatedOptions = selectedItem.options.filter((option) => option.id !== optionId)
      setSelectedItem({
        ...selectedItem,
        options: updatedOptions,
      })
    }

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle updating an option
  const handleUpdateOption = async (fieldsetId, fieldId, optionId, value) => {
    const updatedFieldsets = fieldsets.map((fieldset) => {
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
    })

    setFieldsets(updatedFieldsets)

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

    // Save to API
    await saveFormToApi(updatedFieldsets)
  }

  // Handle saving the form
  const handleSaveForm = async () => {
    const success = await saveFormToApi(fieldsets)
    if (success) {
      alert("Form saved successfully!")
    }
  }

  // Handle draft save
  const handleDraft = async () => {
    const success = await saveFormToApi(fieldsets)
    if (success) {
      alert("Draft saved successfully!")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-red-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form builder...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        <Header saving={saving} />
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
          <button
            className={`px-6 py-2 mr-2 text-gray-700 bg-gray-300 rounded-md text-sm ${saving ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
            onClick={handleDraft}
            disabled={saving}
          >
            {saving ? "Saving..." : "Draft"}
          </button>
          <button
            className={`px-6 py-2 text-white bg-red-500 rounded-md text-sm ${saving ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
            onClick={handleSaveForm}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>
    </DndProvider>
  )
}

export default FormBuilder
