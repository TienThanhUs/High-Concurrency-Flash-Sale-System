package com.hcmus.FlashMart_API.infrastructure.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username khong duoc de trong")
    @Size(min = 8, max = 50, message = "Username phai tu 8 den 50 ky tu")
    private String username;

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong hop le !!!")
    private String email;

    @NotBlank(message = "Password khong duoc de trong")
    private String password;
}
