// API service for form builder

const API_URL = "http://team.dev.helpabode.com:54292/api/wempro/react-dev/coding-test/nazimahmedprovat@gmail.com"

export async function getFormData() {
    try {
        const response = await fetch(API_URL)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching form data:", error)
        throw error
    }
}

export async function updateFormData(formData) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error updating form data:", error)
        throw error
    }
}

export function convertToApiFormat(fieldsets) {
    return fieldsets.map((fieldset) => {
        return {
            fieldsetName: fieldset.name,
            fieldsetTextId: fieldset.id.replace(/-/g, "").substring(0, 10).toLowerCase(),
            fields: fieldset.fields.map((field) => {
                return {
                    labelName: field.name,
                    labelTextId: field.id.replace(/-/g, "").substring(0, 10).toLowerCase(),
                    inputType: mapInternalTypeToApiType(field.type),
                    options: getOptionsForApiFormat(field),
                }
            }),
        }
    })
}

export function convertToInternalFormat(apiData) {
    return apiData.map((fieldset) => {
        return {
            id: fieldset.fieldsetTextId,
            name: fieldset.fieldsetName,
            fields: fieldset.fields.map((field) => {
                const fieldType = mapApiTypeToInternalType(field.inputType)
                return {
                    id: field.labelTextId,
                    type: fieldType,
                    name: field.labelName,
                    label: field.labelName,
                    placeholder: "",
                    required: false,
                    options: getOptionsForInternalFormat(field, fieldType),
                }
            }),
        }
    })
}

function mapInternalTypeToApiType(internalType) {
    const typeMap = {
        text: "text",
        number: "number",
        select: "select",
        "number-select": "select",
        radio: "radio",
        checkbox: "checkbox",
        date: "date",
        label: "label",
        textarea: "textarea",
    }
    return typeMap[internalType] || internalType
}

function mapApiTypeToInternalType(apiType) {
    const typeMap = {
        text: "text",
        number: "number",
        select: "select",
        radio: "radio",
        checkbox: "checkbox",
        date: "date",
        label: "label",
        textarea: "textarea",
    }
    return typeMap[apiType] || apiType
}

function getOptionsForApiFormat(field) {
    if (
        field.type === "select" ||
        field.type === "number-select" ||
        field.type === "radio" ||
        field.type === "checkbox"
    ) {
        return field.options.map((option) => option.value)
    }
    return ""
}

function getOptionsForInternalFormat(field, fieldType) {
    if (fieldType === "select" || fieldType === "number-select" || fieldType === "radio" || fieldType === "checkbox") {
        if (Array.isArray(field.options)) {
            return field.options.map((option, index) => ({
                id: `option-${index}`,
                value: option,
            }))
        }
        return []
    }
    return []
}