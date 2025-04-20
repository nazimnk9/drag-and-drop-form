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
  const [fieldsets, setFieldsets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [localChanges, setLocalChanges] = useState([])

  const fetchFormData = async () => {
    try {
      setLoading(true)
      const data = await getFormData()

      if (data && data.your_respons) {
        const internalFormat = convertToInternalFormat(data.your_respons)
        setFieldsets(internalFormat)
        setLocalChanges(internalFormat)
      } else {
        setFieldsets([])
        setLocalChanges([])
      }

      setError(null)
    } catch (err) {
      console.error("Failed to fetch form data:", err)
      setError("Failed to load form data. Please try again later.")
      setFieldsets([])
      setLocalChanges([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFormData()
  }, [])

  const saveFormToApi = async () => {
    try {
      setSaving(true)
      const apiFormat = convertToApiFormat(localChanges)
      const response = await updateFormData(apiFormat)

      if (response) {
        await fetchFormData()
        alert("Form saved successfully!")
      }
    } catch (err) {
      console.error("Failed to save form data:", err)
      setError("Failed to save form data. Please try again later.")
    } finally {
      setSaving(false)
    }
  }

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
    const existingNames = localChanges.flatMap((fieldset) => [
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

  const handleDropField = (fieldType, fieldsetId, index) => {
    let updatedFieldsets = [...localChanges]

    if (localChanges.length === 0 || !fieldsetId) {
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
        ...localChanges,
        {
          id: newFieldsetId,
          name: generateUniqueName("fieldset"),
          fields: [newField],
        },
      ]

      setLocalChanges(updatedFieldsets)
      setSelectedItem({ ...newField, fieldsetId: newFieldsetId })
    } else {
      updatedFieldsets = localChanges.map((fieldset) => {
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

      setLocalChanges(updatedFieldsets)
    }
  }

  const handleUpdateField = (fieldsetId, fieldId, updates) => {
    const updatedFieldsets = localChanges.map((fieldset) => {
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

    setLocalChanges(updatedFieldsets)

    if (selectedItem && selectedItem.id === fieldId) {
      setSelectedItem({ ...selectedItem, ...updates })
    }
  }

  const handleUpdateFieldset = (fieldsetId, updates) => {
    const updatedFieldsets = localChanges.map((fieldset) => {
      if (fieldset.id === fieldsetId) {
        return { ...fieldset, ...updates }
      }
      return fieldset
    })

    setLocalChanges(updatedFieldsets)

    if (selectedItem && selectedItem.id === fieldsetId && selectedItem.type === "fieldset") {
      setSelectedItem({ ...selectedItem, ...updates })
    }
  }

  const handleDeleteField = (fieldsetId, fieldId) => {
    const updatedFieldsets = localChanges
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

    setLocalChanges(updatedFieldsets)

    if (selectedItem && selectedItem.id === fieldId) {
      setSelectedItem(null)
    }
  }

  const handleDuplicateField = (fieldsetId, fieldId) => {
    const updatedFieldsets = localChanges.map((fieldset) => {
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

    setLocalChanges(updatedFieldsets)
  }

  const handleMoveField = (sourceFieldsetId, sourceIndex, targetFieldsetId, targetIndex) => {
    const newFieldsets = [...localChanges]
    const sourceFieldset = newFieldsets.find((fs) => fs.id === sourceFieldsetId)
    const targetFieldset = newFieldsets.find((fs) => fs.id === targetFieldsetId)

    if (!sourceFieldset || !targetFieldset) return

    const [movedField] = sourceFieldset.fields.splice(sourceIndex, 1)
    targetFieldset.fields.splice(targetIndex, 0, movedField)

    setLocalChanges(newFieldsets)
  }

  const handleMoveFieldset = (dragIndex, hoverIndex) => {
    const newFieldsets = [...localChanges]
    const [movedFieldset] = newFieldsets.splice(dragIndex, 1)
    newFieldsets.splice(hoverIndex, 0, movedFieldset)
    setLocalChanges(newFieldsets)
  }

  const handleSelectItem = (item) => {
    setSelectedItem(item)
  }

  const handleAddOption = (fieldsetId, fieldId) => {
    const updatedFieldsets = localChanges.map((fieldset) => {
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

    setLocalChanges(updatedFieldsets)

    if (selectedItem && selectedItem.id === fieldId) {
      const newOption = { id: uuidv4(), value: `Option ${selectedItem.options.length + 1}` }
      setSelectedItem({
        ...selectedItem,
        options: [...selectedItem.options, newOption],
      })
    }
  }

  const handleDeleteOption = (fieldsetId, fieldId, optionId) => {
    const updatedFieldsets = localChanges.map((fieldset) => {
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

    setLocalChanges(updatedFieldsets)

    if (selectedItem && selectedItem.id === fieldId) {
      const updatedOptions = selectedItem.options.filter((option) => option.id !== optionId)
      setSelectedItem({
        ...selectedItem,
        options: updatedOptions,
      })
    }
  }

  const handleUpdateOption = (fieldsetId, fieldId, optionId, value) => {
    const updatedFieldsets = localChanges.map((fieldset) => {
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

    setLocalChanges(updatedFieldsets)

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

  const handleDraft = async () => {
    try {
      setSaving(true)
      const apiFormat = convertToApiFormat(localChanges)
      await updateFormData(apiFormat)
      alert("Draft saved successfully!")
    } catch (err) {
      console.error("Failed to save draft:", err)
      setError("Failed to save draft. Please try again later.")
    } finally {
      setSaving(false)
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
            fieldsets={localChanges}
            onDropField={handleDropField}
            onSelectItem={handleSelectItem}
            selectedItem={selectedItem}
            onMoveField={handleMoveField}
            onMoveFieldset={handleMoveFieldset}
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
            onClick={saveFormToApi}
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