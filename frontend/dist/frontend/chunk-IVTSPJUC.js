function n(o,s){return t=>{let e=t.controls[o],r=t.controls[s];r.errors&&!r.errors.mustMatch||(e.value!==r.value?r.setErrors({mustMatch:!0}):r.setErrors(null))}}export{n as a};
