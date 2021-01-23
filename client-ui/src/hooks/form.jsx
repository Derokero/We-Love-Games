import {useState} from "react";
import Joi from "joi/dist/joi-browser.min.js";

export default function useForm(schema, submitCallback) {
	const [inputs, setInputs] = useState({});
	const [errors, setErrors] = useState({});

	function handleFormChange({target: input}) {
		const updatedInputs = {
			...inputs,
			[input.id]: input.value,
		};
		setInputs(updatedInputs);

		const joiSchema = Joi.object(schema);
		const validationError = joiSchema.validate(updatedInputs, {abortEarly: false});

		setErrors((errors) => {
			const newErrors = {};
			if (!validationError.error) return {noErrors: true}; // No errors were found

			for (const detail of validationError.error.details) {
				// Display error only if the input was changed
				if (validationError.value[detail.path] !== undefined) {
					newErrors[detail.path] = detail.message;
				}
			}

			return newErrors;
		});
	}

	function handleFormSubmit(ev) {
		ev.preventDefault();

		if (!errors["noErrors"]) return false;

		submitCallback();
	}
	return {inputs, setInputs, errors, setErrors, handleFormSubmit, handleFormChange};
}
