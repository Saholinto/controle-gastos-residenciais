using System.ComponentModel.DataAnnotations;
using ControleGastos.Api.Enums;

namespace ControleGastos.Api.DTOs.Transactions;

/// <summary>
/// Dados necessários para cadastrar uma nova transação.
/// </summary>
public class CreateTransactionRequest
{
    [Required(ErrorMessage = "A descrição é obrigatória.")]
    [StringLength(
        200,
        MinimumLength = 2,
        ErrorMessage = "A descrição deve possuir entre 2 e 200 caracteres.")]
    public string Description { get; set; } = string.Empty;

    [Range(
        0.01,
        999999999,
        ErrorMessage = "O valor deve ser maior que zero.")]
    public decimal Amount { get; set; }

    [EnumDataType(
        typeof(TransactionType),
        ErrorMessage = "O tipo da transação é inválido.")]
    public TransactionType Type { get; set; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "O identificador da pessoa é obrigatório.")]
    public int PersonId { get; set; }
}