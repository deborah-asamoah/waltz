package com.khartec.waltz.integration_test.inmem.helpers;

import com.khartec.waltz.model.person.PersonKind;
import com.khartec.waltz.schema.tables.records.PersonRecord;
import org.jooq.DSLContext;

import java.util.concurrent.atomic.AtomicLong;

import static com.khartec.waltz.schema.tables.Person.PERSON;

public class PersonHelper {

    private static final AtomicLong ctr = new AtomicLong();

    private final DSLContext dsl;

    public PersonHelper(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Long createPerson(String name) {
        PersonRecord p = dsl.newRecord(PERSON);
        p.setDepartmentName("dept");
        p.setEmail(name);
        p.setKind(PersonKind.EMPLOYEE.name());
        p.setDisplayName(name);
        p.setEmployeeId(Long.toString(ctr.incrementAndGet()));
        p.insert();

        return p.getId();
    }
}
