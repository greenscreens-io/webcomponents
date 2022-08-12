export function attachTooltips(target) {
	const el = target.querySelectorAll('[data-bs-toggle="tooltip"]');
	const tooltipTriggerList = [].slice.call(el);
	const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
	  return new bootstrap.Tooltip(tooltipTriggerEl);
	});
}

export function attachDropdowns(target) {
	const dropdownElementList = [].slice.call(target.querySelectorAll('.dropdown-toggle'))
	const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
	  return new bootstrap.Dropdown(dropdownToggleEl)
	});
}
