function getColorTag(variable) {
    return `var-color-${(variable % 6) + 1}`
}
export default getColorTag
