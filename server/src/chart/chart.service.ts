import { Injectable } from '@nestjs/common';
import { ChartDto } from './dto/chart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IndustrialVisitEntity } from 'src/industrial-visit/entities/industrial-visit.entity';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { getCSVBase64URL } from 'src/config/common-config';

const DEPARTSMENTS = [
  {
    label: 'Bachelor of Mechanical Engineering',
    value: 'bachelor_mechanical_engineering',
  },
  {
    label: 'Bachelor of Civil Engineering',
    value: 'bachelor_civil_engineering',
  },
  {
    label: 'Bachelor of Electrical Engineering',
    value: 'bachelor_electrical_engineering',
  },
  {
    label: 'Bachelor of Electronics and Communication Engineering',
    value: 'bachelor_electronics_and_communication_engineering',
  },
  {
    label: 'Bachelor of Electrical and Electronics Engineering',
    value: 'bachelor_electrical_and_electronics_engineering',
  },
  {
    label: 'Bachelor of Computer Science Engineering',
    value: 'bachelor_computer_science_engineering',
  },
  {
    label: 'Bachelor of Information Technology',
    value: 'bachelor_information_technology',
  },
  {
    label: 'Bachelor of Chemical Engineering',
    value: 'bachelor_chemical_engineering',
  },
  {
    label: 'Bachelor of Aerospace Engineering',
    value: 'bachelor_aerospace_engineering',
  },
];

@Injectable()
export class ChartService {
  constructor(
    @InjectRepository(IndustrialVisitEntity)
    private readonly industrialVisitRepository: Repository<IndustrialVisitEntity>,
  ) {}

  async filterData(payload: ChartDto[], user: any) {
    const qb = this.industrialVisitRepository
      .createQueryBuilder('industrial_visit')
      .leftJoinAndSelect('industrial_visit.industry', 'industry')
      .leftJoinAndSelect('industrial_visit.visitors', 'visitor')
      .leftJoinAndSelect('visitor.institute', 'institute')
      .orderBy('industrial_visit.createdAt', 'DESC');

    if (user.role === 'industry') {
      qb.andWhere('industrial_visit.industryId = :industryId', {
        industryId: user.indIns.id,
      });
    }

    if (user.role === 'institute') {
      qb.andWhere('(institute.id = :instituteId)', {
        instituteId: user.indIns.id,
      });
    }

    payload.forEach((p) => {
      if (p.field === 'year') {
        if (p.condition === 'is') {
          qb.andWhere('EXTRACT(YEAR FROM industrial_visit.createdAt) = :year', {
            year: p.value,
          });
        } else if (p.condition === 'not') {
          qb.andWhere(
            'EXTRACT(YEAR FROM industrial_visit.createdAt) <> :year',
            {
              year: p.value,
            },
          );
        } else if (p.condition === 'between') {
          qb.andWhere(
            'EXTRACT(YEAR FROM industrial_visit.createdAt) BETWEEN :startYear AND :endYear',
            {
              startMonth: p.from,
              endMonth: p.to,
            },
          );
        } else if (p.condition === 'last') {
          const currentYear = new Date().getFullYear();
          qb.andWhere(
            'EXTRACT(YEAR FROM industrial_visit.createdAt) >= :minYear',
            {
              minYear: currentYear - parseInt(p.value),
            },
          );
        }
      } else if (p.field === 'month') {
        if (p.condition === 'is') {
          qb.andWhere(
            'EXTRACT(MONTH FROM industrial_visit.createdAt) = :month',
            {
              month: p.value,
            },
          );
        } else if (p.condition === 'not') {
          qb.andWhere(
            'EXTRACT(MONTH FROM industrial_visit.createdAt) <> :month',
            {
              month: p.value,
            },
          );
        } else if (p.condition === 'between') {
          qb.andWhere(
            'EXTRACT(MONTH FROM industrial_visit.createdAt) BETWEEN :startMonth AND :endMonth',
            {
              startMonth: p.from,
              endMonth: p.to,
            },
          );
        } else if (p.condition === 'last') {
          // qb.andWhere(
          //   'industrial_visit.createdAt >= NOW() - INTERVAL :months MONTH',
          //   { months: p.value },
          // );
          qb.andWhere(
            `industrial_visit.createdAt >= NOW() - INTERVAL '${p.value} MONTH'`,
          );
        }
      }
    });

    const ivData = await qb.getMany();

    // Utility function to process counts
    const getCountBasedYear = (dataList, idExtractor, yearExtractor) => {
      const result = {};
      const sample = {};

      dataList.forEach((data) => {
        const year = yearExtractor(data);
        const id = idExtractor(data);
        if (!sample[year]) {
          sample[year] = new Set();
          result[year] = 0;
        }
        if (!sample[year].has(id)) {
          sample[year].add(id);
          result[year]++;
        }
      });

      return result;
    };

    // Get IV count based on year
    let ivCountBasedYear = ivData.reduce((acc, data) => {
      const fetchYear = dayjs(data.createdAt).format('YYYY');
      acc[fetchYear] = (acc[fetchYear] || 0) + 1;
      return acc;
    }, {});

    if (ivCountBasedYear) {
      // Convert the object to CSV format
      const csvHeader = 'Year,Count\n';
      const csvRows = Object.entries(ivCountBasedYear)
        .map(([year, count]) => `${year},${count}`)
        .join('\n');
      const csvContent = csvHeader + csvRows;

      ivCountBasedYear = {
        downloadUrl: getCSVBase64URL(csvContent),
        data: ivCountBasedYear,
      };
    }

    let instituteAppliedCountBasedYear = {};
    if (user.role === 'industry') {
      // Get institute applied count based on year
      instituteAppliedCountBasedYear = getCountBasedYear(
        ivData.flatMap((data) => data.visitors),
        (visitor) => visitor.institute.id,
        (visitor) => dayjs(visitor.createdAt).format('YYYY'),
      );
      // Convert the object to CSV format
      const csvHeader = 'Year,Count\n';
      const csvRows = Object.entries(instituteAppliedCountBasedYear)
        .map(([year, count]) => `${year},${count}`)
        .join('\n');
      const csvContent = csvHeader + csvRows;

      instituteAppliedCountBasedYear = {
        downloadUrl: getCSVBase64URL(csvContent),
        data: instituteAppliedCountBasedYear,
      };
    }

    // Get visitors attend and not-attend count based on year
    let visitorsCountBasedYear: any = {
      attend: getCountBasedYear(
        ivData.flatMap((data) =>
          data.visitors.filter((visitor) => visitor.attend),
        ),
        (visitor) => visitor.id,
        (visitor) => dayjs(visitor.createdAt).format('YYYY'),
      ),
      notAttend: getCountBasedYear(
        ivData.flatMap((data) =>
          data.visitors.filter((visitor) => visitor.attend === false),
        ),
        (visitor) => visitor.id,
        (visitor) => dayjs(visitor.createdAt).format('YYYY'),
      ),
    };
    if (isEmpty(visitorsCountBasedYear.attend))
      delete visitorsCountBasedYear.attend;
    if (isEmpty(visitorsCountBasedYear.notAttend))
      delete visitorsCountBasedYear.notAttend;

    if (!isEmpty(visitorsCountBasedYear)) {
      // Convert the object to CSV format
      const csvHeader = 'Year,Attend,Not Attend\n';
      const years = new Set([
        ...Object.keys(visitorsCountBasedYear.attend || {}),
        ...Object.keys(visitorsCountBasedYear.notAttend || {}),
      ]);

      const csvRows = [...years].map((year) => {
        const attendCount = visitorsCountBasedYear.attend?.[year] || 0;
        const notAttendCount = visitorsCountBasedYear.notAttend?.[year] || 0;
        return `${year},${attendCount},${notAttendCount}`;
      });

      const csvContent = csvHeader + csvRows;

      visitorsCountBasedYear = {
        downloadUrl: getCSVBase64URL(csvContent),
        data: visitorsCountBasedYear,
      };
    }

    // Get individual institute count based on year
    let individualInsCountBasedYear = {};
    if (user.role === 'industry') {
      const sample2 = {};
      ivData.forEach((data) => {
        data.visitors.forEach((visitor) => {
          const fetchYear = dayjs(visitor.createdAt).format('YYYY');
          const instituteName = visitor.institute.name;

          if (!sample2[instituteName]) {
            sample2[instituteName] = {};
            individualInsCountBasedYear[instituteName] = {};
          }
          if (!sample2[instituteName][fetchYear]) {
            sample2[instituteName][fetchYear] = new Set();
            individualInsCountBasedYear[instituteName][fetchYear] = 0;
          }
          if (!sample2[instituteName][fetchYear].has(visitor.institute.id)) {
            sample2[instituteName][fetchYear].add(visitor.institute.id);
            individualInsCountBasedYear[instituteName][fetchYear]++;
          }
        });
      });
      const csvHeader = 'Year,Institute Name,Count\n';
      const csvRows = [];

      // Loop through each institute
      for (const [instituteName, yearData] of Object.entries(
        individualInsCountBasedYear,
      )) {
        for (const [year, count] of Object.entries(yearData)) {
          csvRows.push(`${year},"${instituteName}",${count}`);
        }
      }
      const csvContent = csvHeader + csvRows;

      individualInsCountBasedYear = {
        downloadUrl: getCSVBase64URL(csvContent),
        data: individualInsCountBasedYear,
      };
    }

    // Get individual industry count based on year
    let individualIndCountBasedYear = {};
    if (user.role === 'institute') {
      const sample3 = {};
      ivData.forEach((data) => {
        data.visitors.forEach((visitor) => {
          const fetchYear = dayjs(visitor.createdAt).format('YYYY');
          const industryName = data.industry.name;

          if (!sample3[industryName]) {
            sample3[industryName] = {};
            individualIndCountBasedYear[industryName] = {};
          }
          if (!sample3[industryName][fetchYear]) {
            sample3[industryName][fetchYear] = new Set();
            individualIndCountBasedYear[industryName][fetchYear] = 0;
          }
          if (!sample3[industryName][fetchYear].has(data.industry.id)) {
            sample3[industryName][fetchYear].add(data.industry.id);
            individualIndCountBasedYear[industryName][fetchYear]++;
          }
        });
      });
      const csvHeader = 'Year,Industry Name,Count\n';
      const csvRows = [];

      // Loop through each institute
      for (const [industryName, yearData] of Object.entries(
        individualIndCountBasedYear,
      )) {
        for (const [year, count] of Object.entries(yearData)) {
          csvRows.push(`${year},"${industryName}",${count}`);
        }
      }
      const csvContent = csvHeader + csvRows.join('\n');

      individualIndCountBasedYear = {
        downloadUrl: getCSVBase64URL(csvContent),
        data: individualIndCountBasedYear,
      };
    }

    // Get individual department count based on year
    let individualDeptCountBasedYear = {};
    if (user.role === 'institute') {
      const sample4 = {};
      ivData.forEach((data) => {
        data.visitors.forEach((visitor) => {
          const fetchYear = dayjs(visitor.createdAt).format('YYYY');
          const deptName = DEPARTSMENTS.find(
            (d) => d.value === visitor.dept,
          ).label;

          if (!sample4[deptName]) {
            sample4[deptName] = {};
            individualDeptCountBasedYear[deptName] = {};
          }
          if (!sample4[deptName][fetchYear]) {
            sample4[deptName][fetchYear] = new Set();
            individualDeptCountBasedYear[deptName][fetchYear] = 0;
          }
          if (!sample4[deptName][fetchYear].has(data.industry.id)) {
            sample4[deptName][fetchYear].add(data.industry.id);
            individualDeptCountBasedYear[deptName][fetchYear]++;
          }
        });
      });
      const csvHeader = 'Year,Department Name,Count\n';
      const csvRows = [];

      // Loop through each department
      for (const [deptName, yearData] of Object.entries(
        individualDeptCountBasedYear,
      )) {
        for (const [year, count] of Object.entries(yearData)) {
          csvRows.push(`${year},"${deptName}",${count}`);
        }
      }
      const csvContent = csvHeader + csvRows.join('\n');

      individualDeptCountBasedYear = {
        downloadUrl: getCSVBase64URL(csvContent),
        data: individualDeptCountBasedYear,
      };
    }

    const result =
      user.role === 'institute'
        ? {
            ivCountBasedYear,
            visitorsCountBasedYear,
            individualIndCountBasedYear,
            individualDeptCountBasedYear,
          }
        : {
            ivCountBasedYear,
            instituteAppliedCountBasedYear,
            visitorsCountBasedYear,
            individualInsCountBasedYear,
          };

    return result;
  }
}
