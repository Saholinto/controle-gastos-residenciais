namespace ControleGastos.Api.DTOs.Totals;

/// <summary>
/// Representa os totais financeiros individuais de uma pessoa.
/// </summary>
public class PersonTotalsResponse
{
    public int PersonId { get; set; }

    public string PersonName { get; set; } = string.Empty;

    public decimal TotalIncome { get; set; }

    public decimal TotalExpense { get; set; }

    public decimal Balance { get; set; }
}