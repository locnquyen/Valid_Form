//Đối tượng
function Validator(options) {
    //lưu tất cả các rules
    var selectorRules = {};
    //hàm thực hiện validate (ràng buộc)
    // xữ lý khi chưa nhập vào input và ràng buộc mail
    function validate(inputElement, rule) {

        //lấy ra element cha(của input) và query vào element form-message
        var errorElement =
            inputElement.parentElement.querySelector(options.errorSelector);
        //value: inputElement.value
        //test function: rule.test
        var errorMessage;

        //= rule.test(inputElement.value);
        //lấy ra các rule của selector
        var rules = selectorRules[rule.selector];

        //lặp qua từng rules nếu có lỗi thì dừng kiểm tra
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            //console.log(errorMessage);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add("invalid");
        } else {
            errorElement.innerText = "";
            inputElement.parentElement.classList.remove("invalid");
        }
        return !errorMessage;
    }

    //lấy element của form validate
    var formElement = document.querySelector(options.form);
    // xữ lý trường hợp blur ra khỏi input
    if (formElement) {
        //khi submit form
        formElement.onsubmit = e => {
            isFormValid = true;
            e.preventDefault();
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            // trường hợp submit với js
            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value
                        return values;
                    }, {});
                    options.onSubmit(formValues)
                }
            } else {
                //submit với hành vi mặc định
                formElement.onsubmit();
            }
        }

        //lấy ra từng phần tử input
        options.rules.forEach((rule) => {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                //lưul lại các rules qua vòng lặp
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                //xữ lý khi người dùng blur ra khỏi input
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                };
                // xữ lý khi người dùng nhập vào input thì không báo lỗi
                inputElement.oninput = () => {
                    var errorElement =
                        inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = "";
                    inputElement.parentElement.classList.remove("invalid");
                }
            }
        });
    }

}
// Required
//Nguyên tắc của các Rule
//Khi có lỗi: Trả ra mess lỗi
//Khi hợp lệ: không trả ra cái gì cả (undefined)
//validator cho name input
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            //hàm trim() để loại bỏ khoảng trắng
            return value.trim() ? undefined : "Vui lòng nhập trường này!";
        },
    };
};
//validator cho email input
Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            // regex để ràng buộc email
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Trường này phải là Email!";
        },
    };
};
Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `Trường này phải lớn hơn ${min} ký tự`;
        },
    };
};
Validator.isConfirmed = function (selector, getPassWordValue) {
    return {
        selector: selector,
        test: function (value) {
            return value === getPassWordValue() ? undefined : 'Giá trị nhập vào không chính xác';
        },
    };
}