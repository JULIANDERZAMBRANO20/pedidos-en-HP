import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Llaves} from '../config/llaves'; // SE IMPORTÓ PARA INYECTAR LA URL EN EL FETCH UBICADO EN EL METODO POST
import {Credenciales, Persona} from '../models';
import {PersonaRepository} from '../repositories';
import {AutenticacionService} from '../services';
const fetch = require("node-fetch");  // SE IMPORTA PARA LAS NOTIFICACIONES


export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository: PersonaRepository,
    @service(AutenticacionService)   // SE IMPORTÓ PARA LA AUTETINCACION -> AQUI SE INSTANCIA LA CARPETA SERVICIOS-> AUTETICACION SERVICIOS
    public servicioAutenticacion: AutenticacionService

  ) { }

  @post("/identificadorPersona", {
    responses: {
      "200": {
        description: "Identificacion de usuarios"
      }
    }
  })
  async identificadorPersona(
    @requestBody() Credenciales: Credenciales
  ) {
    let p = await this.servicioAutenticacion.IdentificacionPersona(Credenciales.usuario, Credenciales.clave);
    if (p) {
      let token = this.servicioAutenticacion.GenerarTokenJWT(p);
      return {
        datos: {
          nombres: p.nombre,
          correo: p.correo,
          id: p.id
        },
        tk: token
      }
    } else {
      throw new HttpErrors[401]("Datos invalidos");
    }

  }

  @post('/personas')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
  ): Promise<Persona> {

    // AUTETUCACION
    console.log("Empieza autenticacion");
    let clave = this.servicioAutenticacion.GeneradorClave();  // SE LLAMA EL METODO GENERAODR CLAVE
    console.log("Se ha generado clave");
    let claveCifrada = this.servicioAutenticacion.CifrarClave(clave); // SE LLAMA EL METODO CIFRAR CLAVE
    persona.clave = claveCifrada;
    console.log("Se ha generado clave CIFRADA" + claveCifrada);
    let p = await this.personaRepository.create(persona);  // se reemplazo el RETURN por un AWAIT y se añadio en una variable P
    console.log("HASTA AQUI AUTENTICACION");

    // NOTIFICACION AL USUARIO

    let destino = persona.correo;
    console.log("Destino");
    let asunto = 'registro en la plataforma';
    console.log("Asunto");
    let contenido = `Hola ${persona.nombre}, su nombre de usuario es ${persona.correo}, y sucontraseña es ${clave} `;
    console.log("CONTENIDO");
    //fetch(`http://127.0.0.1:5000/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)  ANTES DE INYECTAR LA URL
    fetch(`${Llaves.UrlServiceNotificaciones}/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
      //console.log("URL");
      .then((data: any) => {
        console.log(data);
      })
    return p;


  }

  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'}) filter?: FilterExcludingWhere<Persona>
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }
}
function then(arg0: (data: any) => void) {
  throw new Error('Function not implemented.');
}

