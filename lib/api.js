// API service for form builder

// Main API endpoint
const API_URL = "http://team.dev.helpabode.com:54292/api/wempro/react-dev/coding-test/nazimahmedprovat@gmail.com"

// Function to fetch form data from API
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

// Function to update form data via API
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

// Convert internal form structure to API format
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

// Convert API format to internal form structure
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

// Helper function to map internal field types to API field types
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

// Helper function to map API field types to internal field types
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

// Helper function to get options in the format expected by the API
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

// Helper function to convert API options to internal format
function getOptionsForInternalFormat(field, fieldType) {
    if (fieldType === "select" || fieldType === "number-select" || fieldType === "radio" || fieldType === "checkbox") {
        if (Array.isArray(field.options)) {
            return field.options.map((option, index) => ({
                id: `option-${index}`,
                value: option,
            }))
        }
    }
    return []
}
