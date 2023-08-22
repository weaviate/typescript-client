/**
 * This function converts a file blob into a base64 string so that it can be
 * sent to Weaviate and stored as a media field.
 *
 * This specific function is only applicable within the browser since it depends on
 * the FileReader API. It will throw an error if it is called in a Node environment.
 *
 * @param {Blob} blob The file blob to convert
 * @returns {string} The base64 string
 * @throws An error if the function is called outside of the browser
 *
 * @example
 * // Vanilla JS
 * const file = document.querySelector('input[type="file"]').files[0];
 * toBase64FromBlob(file).then((base64) => console.log(base64));
 *
 * // React
 * const [base64, setBase64] = useState('');
 * const onChange = (event) => toBase64FromBlob(event.target.files[0]).then(setBase64);
 *
 * // Submit
 * const onSubmit = (base64: string) => client.data
 *     .creator()
 *     .withClassName('MyClass')
 *     .withProperties({ myMediaField: base64 })
 *     .do();
 *
 */
export function toBase64FromBlob(blob: Blob): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('This function is only available in the browser');
  }
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = resolve;
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  }).then(() => {
    if (typeof reader.result !== 'string') {
      throw new Error(
        `Unexpected result when converting blob to base64 (result is not a string): ${reader.result}`
      );
    }
    return reader.result;
  });
}
