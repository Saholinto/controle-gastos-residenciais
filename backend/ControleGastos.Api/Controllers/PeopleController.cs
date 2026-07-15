using ControleGastos.Api.DTOs.People;
using ControleGastos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/people")]
public class PeopleController : ControllerBase
{
    private readonly PersonService _personService;

    public PeopleController(PersonService personService)
    {
        _personService = personService;
    }

    /// <summary>
    /// Lista todas as pessoas cadastradas.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<PersonResponse>),
        StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PersonResponse>>> GetAll()
    {
        var people = await _personService.GetAllAsync();

        return Ok(people);
    }

    /// <summary>
    /// Cadastra uma nova pessoa.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(
        typeof(PersonResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PersonResponse>> Create(
        [FromBody] CreatePersonRequest request)
    {
        var person = await _personService.CreateAsync(request);

        return Created(
            $"/api/people/{person.Id}",
            person);
    }

    /// <summary>
    /// Exclui uma pessoa e todas as transações vinculadas a ela.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _personService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Pessoa não encontrada."
            });
        }

        return NoContent();
    }
}