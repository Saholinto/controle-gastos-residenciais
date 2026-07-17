using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.DTOs.People;

/// <summary>
/// Dados necessários para cadastrar uma nova pessoa.
/// </summary>
public class CreatePersonRequest
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(
        100,
        MinimumLength = 2,
        ErrorMessage = "O nome deve possuir entre 2 e 100 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Range(
        0,
        130,
        ErrorMessage = "A idade deve estar entre 0 e 130 anos.")]
    public int Age { get; set; }
}